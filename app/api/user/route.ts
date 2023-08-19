import User, { UserDoc } from 'models/User'
import { MongoServerError } from 'mongodb'
import { UpdateQuery } from 'mongoose'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import addUserSchema from 'schemas/addUserSchema'
import updateUserApiSchema from 'schemas/updateUserApiSchema'
import err from 'utils/constants/errors'
import dbConnect from 'utils/functions/dbConnect'
import deleteImage from 'utils/functions/deleteImage'
import getServerPusher from 'utils/functions/getServerPusher'
import hashPassword from 'utils/functions/hashPassword'
import verifyCsrfTokens from 'utils/functions/verifyCsrfTokens'
import validate from 'utils/functions/validate'
import { nextAuthOptions } from '../auth/[...nextauth]/route'

export async function POST(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: err.DATA_INVALID }, { status: 422 })
  }

  const result = validate(addUserSchema, data)

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
      { id: user._id },
      {
        status: 201,
        headers: { Location: '/profile' },
      }
    )
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return NextResponse.json(
        { message: err.EMAIL_USED, name: 'email' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

  const result = validate(updateUserApiSchema, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  const { csrfToken, ...requestBody } = result.value

  if (!verifyCsrfTokens(request.cookies, csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  let update: UpdateQuery<UserDoc> = {}

  try {
    await dbConnect()

    if ('name' in requestBody) {
      update.name = requestBody.name
    } else if ('email' in requestBody) {
      update.email = requestBody.email
    } else if ('password' in requestBody) {
      update.password = hashPassword(requestBody.password)
    } else {
      const user = (await User.findById(session.id).lean().exec()) as UserDoc

      if ('image' in requestBody) {
        if (user.image) {
          await deleteImage(user.image)
        }

        update.image = requestBody.image
      } else if ('favPostId' in requestBody) {
        let action = '$push'

        for (const favPostId of user.favPostIds) {
          if (favPostId.toString() === requestBody.favPostId) {
            action = '$pull'
            break
          }
        }

        update[action] = { favPostIds: requestBody.favPostId }
      } else if ('discussionId' in requestBody) {
        await getServerPusher().trigger(
          'private-' + session.channelName,
          'discussion-deleted',
          requestBody.discussionId
        )

        let action = '$push'

        for (const discussionId of user.discussionIds) {
          if (discussionId.toString() === requestBody.discussionId) {
            action = '$pull'
            break
          }
        }

        update = {
          [action]: { discussionIds: requestBody.discussionId },
          hasUnseenMessages: false,
        }
      }
    }

    await User.updateOne({ _id: session.id }, update).lean().exec()
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return NextResponse.json({ message: err.EMAIL_USED }, { status: 422 })
    }

    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }

  return new Response(null, { status: 204 })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: err.UNAUTHORIZED }, { status: 401 })
  }

  let data: { csrfToken?: string } | null = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: err.DATA_INVALID }, { status: 422 })
  }

  if (!data?.csrfToken || !verifyCsrfTokens(request.cookies, data.csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    await User.deleteOne({ _id: session.id }).lean().exec()
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }

  return new Response(null, { status: 204 })
}
