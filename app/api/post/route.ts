import { auth } from 'libs/auth'
import { NextRequest, NextResponse } from 'next/server'
import validate from 'functions/validate'
import createPost from 'schemas/server/createPost'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import dbConnect from 'functions/dbConnect'
import Post from 'models/Post'
import formatToUrl from 'functions/formatToUrl'
import {
  UNAUTHORIZED,
  DATA_INVALID,
  CSRF_TOKEN_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(createPost, data)

  if ('message' in result) {
    return NextResponse.json(
      { name: result.name, message: result.message },
      { status: 422 }
    )
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
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
      { _id: post._id },
      {
        status: 201,
        headers: {
          Location: `/posts/${post._id.toString()}/${formatToUrl(post.name)}`,
        },
      }
    )
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
