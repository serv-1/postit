import User, { type UserDoc } from 'models/User'
import { MongoServerError } from 'mongodb'
import type { UpdateQuery } from 'mongoose'
import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'
import createUser from 'schemas/createUser'
import updateUser from 'schemas/server/updateUser'
import dbConnect from 'functions/dbConnect'
import deleteImage from 'functions/deleteImage'
import hashPassword from 'functions/hashPassword'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import validate from 'functions/validate'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import {
  DATA_INVALID,
  EMAIL_USED,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
} from 'constants/errors'

export async function POST(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(createUser, data)

  if ('message' in result) {
    return NextResponse.json(
      { name: result.name, message: result.message },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const user = await new User(result.value).save()

    return NextResponse.json(
      { _id: user._id },
      {
        status: 201,
        headers: { Location: '/profile' },
      }
    )
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return NextResponse.json(
        { message: EMAIL_USED, name: 'email' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

  const result = validate(updateUser, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  let update: UpdateQuery<UserDoc> = {}

  try {
    await dbConnect()

    data = result.value

    if ('name' in data) {
      update.name = data.name
    } else if ('email' in data) {
      update.email = data.email
    } else if ('password' in data) {
      update.password = hashPassword(data.password)
    } else {
      const user = (await User.findById(session.id).lean().exec())!

      if ('image' in data) {
        if (user.image) {
          await deleteImage(user.image)
        }

        update.image = data.image
      } else if ('favPostId' in data) {
        let action = '$push'

        for (const favPostId of user.favPostIds) {
          if (favPostId.toString() === data.favPostId) {
            action = '$pull'
            break
          }
        }

        update[action] = { favPostIds: data.favPostId }
      } else if ('discussionId' in data) {
        let isHidden = false

        for (const { id, hidden } of user.discussions) {
          if (id.toString() === data.discussionId) {
            isHidden = !hidden
          }
        }

        await User.updateOne(
          { _id: session.id, 'discussions.id': data.discussionId },
          { $set: { 'discussions.$.hidden': isHidden } }
        )
          .lean()
          .exec()

        return new Response(null, { status: 204 })
      }
    }

    await User.updateOne({ _id: session.id }, update).lean().exec()
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return NextResponse.json({ message: EMAIL_USED }, { status: 422 })
    }

    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }

  return new Response(null, { status: 204 })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    await User.deleteOne({ _id: session.id }).lean().exec()
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }

  return new Response(null, { status: 204 })
}
