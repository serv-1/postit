import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import Post, { type PostDoc } from 'models/Post'
import { type UpdateQuery, isValidObjectId } from 'mongoose'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import updatePost from 'schemas/server/updatePost'
import dbConnect from 'functions/dbConnect'
import deleteImage from 'functions/deleteImage'
import validate from 'functions/validate'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import {
  PARAMS_INVALID,
  POST_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
  DATA_INVALID,
  FORBIDDEN,
} from 'constants/errors'

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  const postId = params.id

  if (!isValidObjectId(postId)) {
    return NextResponse.json({ message: PARAMS_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const post = await Post.findById(postId).lean().exec()

    if (!post) {
      return NextResponse.json({ message: POST_NOT_FOUND }, { status: 404 })
    }

    return NextResponse.json(
      {
        _id: post._id,
        name: post.name,
        description: post.description,
        categories: post.categories,
        price: post.price / 100,
        images: post.images,
        address: post.address,
        latLon: post.latLon,
        discussionIds: post.discussionIds,
        userId: post.userId,
      },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const postId = params.id

  if (!isValidObjectId(postId)) {
    return NextResponse.json({ message: PARAMS_INVALID }, { status: 422 })
  }

  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(updatePost, data)

  if ('message' in result) {
    return NextResponse.json(
      { name: result.name, message: result.message },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const post = await Post.findById(postId).lean().exec()

    if (!post) {
      return NextResponse.json({ message: POST_NOT_FOUND }, { status: 404 })
    }

    if (session.id !== post.userId.toString()) {
      return NextResponse.json({ message: FORBIDDEN }, { status: 403 })
    }

    const update: UpdateQuery<PostDoc> = {}

    data = result.value

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
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const postId = params.id

  if (!isValidObjectId(postId)) {
    return NextResponse.json({ message: PARAMS_INVALID }, { status: 422 })
  }

  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const post = await Post.findById(postId).lean().exec()

    if (!post) {
      return NextResponse.json({ message: POST_NOT_FOUND }, { status: 404 })
    }

    if (session.id !== post.userId.toString()) {
      return NextResponse.json({ message: FORBIDDEN }, { status: 403 })
    }

    await Post.deleteOne({ _id: postId }).lean().exec()

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
