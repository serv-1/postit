import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import Post, { PostDoc } from 'models/Post'
import { UpdateQuery, isValidObjectId } from 'mongoose'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import updatePostApiSchema from 'schemas/updatePostApiSchema'
import err from 'utils/constants/errors'
import dbConnect from 'utils/functions/dbConnect'
import deleteImage from 'utils/functions/deleteImage'
import validate from 'utils/functions/validate'
import verifyCsrfTokens from 'utils/functions/verifyCsrfTokens'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id

  if (!isValidObjectId(postId)) {
    return NextResponse.json({ message: err.PARAMS_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const post = await Post.findById(postId).lean().exec()

    if (!post) {
      return NextResponse.json({ message: err.POST_NOT_FOUND }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: post._id.toString(),
        name: post.name,
        description: post.description,
        categories: post.categories,
        price: post.price / 100,
        images: post.images,
        address: post.address,
        latLon: post.latLon,
        discussionIds: post.discussionIds.map((id) => id.toString()),
        userId: post.userId.toString(),
      },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id

  if (!isValidObjectId(postId)) {
    return NextResponse.json({ message: err.PARAMS_INVALID }, { status: 422 })
  }

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

  const result = validate(updatePostApiSchema, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  data = result.value

  if (!verifyCsrfTokens(request.cookies, data.csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const post = await Post.findById(postId).lean().exec()

    if (!post) {
      return NextResponse.json({ message: err.POST_NOT_FOUND }, { status: 404 })
    }

    if (session.id !== post.userId.toString()) {
      return NextResponse.json({ message: err.FORBIDDEN }, { status: 403 })
    }

    const update: UpdateQuery<PostDoc> = {}

    if (data.images) {
      await Promise.all(
        post.images.map(async (image) => {
          return deleteImage(image)
        })
      )

      update.images = data.images
    }

    if (data.price) {
      update.price = data.price * 100
    }

    if (data.name) {
      update.name = data.name
    }

    if (data.description) {
      update.description = data.description
    }

    if (data.categories) {
      update.categories = data.categories
    }

    if (data.address) {
      update.address = data.address
      update.latLon = data.latLon
    }

    await Post.updateOne({ _id: postId }, update).lean().exec()

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id

  if (!isValidObjectId(postId)) {
    return NextResponse.json({ message: err.PARAMS_INVALID }, { status: 422 })
  }

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

  if (!verifyCsrfTokens(request.cookies, data.csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const post = await Post.findById(postId).lean().exec()

    if (!post) {
      return NextResponse.json({ message: err.POST_NOT_FOUND }, { status: 404 })
    }

    if (session.id !== post.userId.toString()) {
      return NextResponse.json({ message: err.FORBIDDEN }, { status: 403 })
    }

    await Post.deleteOne({ _id: postId }).lean().exec()

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
