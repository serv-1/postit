import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { nextAuthOptions } from '../auth/[...nextauth]/route'
import err from 'utils/constants/errors'
import validate from 'utils/functions/validate'
import addPostApiSchema from 'schemas/addPostApiSchema'
import verifyCsrfTokens from 'utils/functions/verifyCsrfTokens'
import dbConnect from 'utils/functions/dbConnect'
import Post from 'models/Post'
import formatToUrl from 'utils/functions/formatToUrl'

export async function POST(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: err.UNAUTHORIZED }, { status: 401 })
  }

  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: err.DATA_INVALID }, { status: 422 })
  }

  const result = validate(addPostApiSchema, data)

  if ('message' in result) {
    return NextResponse.json(
      { name: result.name, message: result.message },
      { status: 422 }
    )
  }

  if (!verifyCsrfTokens(request.cookies, result.value.csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const post = await new Post({
      name: result.value.name,
      description: result.value.description,
      categories: result.value.categories,
      images: result.value.images,
      address: result.value.address,
      latLon: result.value.latLon,
      price: result.value.price * 100,
      userId: session.id,
    }).save()

    return NextResponse.json(
      { id: post._id.toString() },
      {
        status: 201,
        headers: {
          Location: `/posts/${post._id.toString()}/${formatToUrl(post.name)}`,
        },
      }
    )
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
