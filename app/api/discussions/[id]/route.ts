import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import Discussion, { DiscussionDoc } from 'models/Discussion'
import User, { UserDoc } from 'models/User'
import { isValidObjectId } from 'mongoose'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import updateDiscussionApiSchema from 'schemas/updateDiscussionApiSchema'
import err from 'utils/constants/errors'
import dbConnect from 'utils/functions/dbConnect'
import getServerPusher from 'utils/functions/getServerPusher'
import validate from 'utils/functions/validate'
import verifyCsrfTokens from 'utils/functions/verifyCsrfTokens'

interface Params {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  const discussionId = params.id

  if (!isValidObjectId(discussionId)) {
    return NextResponse.json({ message: err.PARAMS_INVALID }, { status: 422 })
  }

  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: err.UNAUTHORIZED }, { status: 401 })
  }

  const csrfToken = request.nextUrl.searchParams.get('csrfToken')

  if (!csrfToken || !verifyCsrfTokens(request.cookies, csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const discussion = await Discussion.findById(discussionId).lean().exec()

    if (!discussion) {
      return NextResponse.json(
        { message: err.DISCUSSION_NOT_FOUND },
        { status: 404 }
      )
    }

    if (
      session.id !== discussion.buyerId?.toString() &&
      session.id !== discussion.sellerId?.toString()
    ) {
      return NextResponse.json({ message: err.FORBIDDEN }, { status: 403 })
    }

    const buyer = await User.findById(discussion.buyerId).lean().exec()
    const seller = await User.findById(discussion.sellerId).lean().exec()

    return NextResponse.json(
      {
        id: discussion._id,
        postId: discussion.postId,
        postName: discussion.postName,
        channelName: discussion.channelName,
        messages: discussion.messages,
        buyer: {
          id: buyer?._id,
          name: buyer ? buyer.name : '[DELETED]',
          image: buyer?.image,
        },
        seller: {
          id: seller?._id,
          name: seller ? seller.name : '[DELETED]',
          image: seller?.image,
        },
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

export async function PUT(request: NextRequest, { params }: Params) {
  const discussionId = params.id

  if (!isValidObjectId(discussionId)) {
    return NextResponse.json({ message: err.PARAMS_INVALID }, { status: 422 })
  }

  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: err.UNAUTHORIZED }, { status: 401 })
  }

  try {
    await dbConnect()

    let discussion = await Discussion.findById(discussionId).lean().exec()

    if (!discussion) {
      return NextResponse.json(
        { message: err.DISCUSSION_NOT_FOUND },
        { status: 404 }
      )
    }

    if (
      session.id !== discussion.buyerId?.toString() &&
      session.id !== discussion.sellerId?.toString()
    ) {
      return NextResponse.json({ message: err.FORBIDDEN }, { status: 403 })
    }

    const buyer = await User.findById(discussion.buyerId).lean().exec()
    const seller = await User.findById(discussion.sellerId).lean().exec()

    if (!buyer || !seller) {
      return NextResponse.json(
        { message: err.CANNOT_SEND_MSG },
        { status: 409 }
      )
    }

    let hasBuyerDeletedDiscussion = true
    let hasSellerDeletedDiscussion = true

    for (const id of buyer.discussionIds) {
      if (id.toString() === discussionId) {
        hasBuyerDeletedDiscussion = false
        break
      }
    }

    for (const id of seller.discussionIds) {
      if (id.toString() === discussionId) {
        hasSellerDeletedDiscussion = false
        break
      }
    }

    if (hasBuyerDeletedDiscussion || hasSellerDeletedDiscussion) {
      return NextResponse.json(
        { message: err.CANNOT_SEND_MSG },
        { status: 409 }
      )
    }

    let data = null

    try {
      data = await request.json()
    } catch (e) {
      return NextResponse.json({ message: err.DATA_INVALID }, { status: 422 })
    }

    const result = validate(updateDiscussionApiSchema, data)

    if ('message' in result) {
      return NextResponse.json({ message: result.message }, { status: 422 })
    }

    if (!verifyCsrfTokens(request.cookies, result.value.csrfToken)) {
      return NextResponse.json(
        { message: err.CSRF_TOKEN_INVALID },
        { status: 422 }
      )
    }

    if ('message' in result.value) {
      const userId =
        session.id === buyer._id.toString()
          ? seller._id.toString()
          : buyer._id.toString()

      await Discussion.findByIdAndUpdate(discussionId, {
        $push: {
          messages: [{ message: result.value.message, userId: session.id }],
        },
      })
        .lean()
        .exec()

      const user = (await User.findByIdAndUpdate(userId, {
        hasUnseenMessages: true,
      })
        .lean()
        .exec()) as UserDoc

      discussion = (await Discussion.findById(discussionId)
        .lean()
        .exec()) as DiscussionDoc

      await getServerPusher().triggerBatch([
        {
          channel: 'private-' + user.channelName,
          name: 'new-message',
          data: '',
        },
        {
          channel: 'private-encrypted-' + discussion.channelName,
          name: 'new-message',
          data: discussion.messages[discussion.messages.length - 1],
        },
      ])
    } else {
      for (let i = discussion.messages.length - 1; i >= 0; i--) {
        const message = discussion.messages[i]

        if (message.userId.toString() !== session.id) {
          if (message.seen) {
            break
          }

          message.seen = true
        }
      }

      await Discussion.findByIdAndUpdate(discussionId, {
        $set: { messages: discussion.messages },
      })
        .lean()
        .exec()

      const user = (await User.findById(session.id).lean().exec()) as UserDoc

      const discussions = await Discussion.find({
        _id: {
          $in: user.discussionIds.filter(
            (id) => id.toString() !== discussionId
          ),
        },
      })
        .lean()
        .exec()

      let hasUnseenMessages = false

      for (const discussion of discussions) {
        const lastMsg = discussion.messages[discussion.messages.length - 1]

        if (lastMsg.userId.toString() !== session.id && !lastMsg.seen) {
          hasUnseenMessages = true
          break
        }
      }

      if (!hasUnseenMessages) {
        await User.findByIdAndUpdate(session.id, { hasUnseenMessages })
          .lean()
          .exec()
      }
    }

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const discussionId = params.id

  if (!isValidObjectId(discussionId)) {
    return NextResponse.json({ message: err.PARAMS_INVALID }, { status: 422 })
  }

  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: err.UNAUTHORIZED }, { status: 401 })
  }

  const csrfToken = request.nextUrl.searchParams.get('csrfToken')

  if (!csrfToken || !verifyCsrfTokens(request.cookies, csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  try {
    await dbConnect()

    const discussion = await Discussion.findById(discussionId).lean().exec()

    if (!discussion) {
      return NextResponse.json(
        { message: err.DISCUSSION_NOT_FOUND },
        { status: 404 }
      )
    }

    if (
      session.id !== discussion.buyerId?.toString() &&
      session.id !== discussion.sellerId?.toString()
    ) {
      return NextResponse.json({ message: err.FORBIDDEN }, { status: 403 })
    }

    await Discussion.deleteOne({ _id: discussionId }).lean().exec()

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
