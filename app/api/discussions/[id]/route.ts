import Discussion from 'models/Discussion'
import User from 'models/User'
import { isValidObjectId } from 'mongoose'
import { auth } from 'libs/auth'
import { NextRequest, NextResponse } from 'next/server'
import updateDiscussion from 'schemas/updateDiscussion'
import dbConnect from 'functions/dbConnect'
import validate from 'functions/validate'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import {
  PARAMS_INVALID,
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
  DISCUSSION_NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  CANNOT_SEND_MSG,
  DATA_INVALID,
} from 'constants/errors'
import pusher from 'libs/pusher/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, segmentData: Params) {
  const params = await segmentData.params
  const discussionId = params.id

  if (!isValidObjectId(discussionId)) {
    return NextResponse.json({ message: PARAMS_INVALID }, { status: 422 })
  }

  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const discussion = await Discussion.findById(discussionId).lean().exec()

    if (!discussion) {
      return NextResponse.json(
        { message: DISCUSSION_NOT_FOUND },
        { status: 404 }
      )
    }

    if (
      session.id !== discussion.buyerId?.toString() &&
      session.id !== discussion.sellerId?.toString()
    ) {
      return NextResponse.json({ message: FORBIDDEN }, { status: 403 })
    }

    const signedInUser = (await User.findById(session.id).lean().exec())!

    let hasNewMessage = false

    for (const discussion of signedInUser.discussions) {
      if (discussion.id.toString() === discussionId) {
        hasNewMessage = discussion.hasNewMessage

        break
      }
    }

    return NextResponse.json({ ...discussion, hasNewMessage }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, segmentData: Params) {
  const params = await segmentData.params
  const discussionId = params.id

  if (!isValidObjectId(discussionId)) {
    return NextResponse.json({ message: PARAMS_INVALID }, { status: 422 })
  }

  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  try {
    await dbConnect()

    let discussion = await Discussion.findById(discussionId).lean().exec()

    if (!discussion) {
      return NextResponse.json(
        { message: DISCUSSION_NOT_FOUND },
        { status: 404 }
      )
    }

    if (
      session.id !== discussion.buyerId?.toString() &&
      session.id !== discussion.sellerId?.toString()
    ) {
      return NextResponse.json({ message: FORBIDDEN }, { status: 403 })
    }

    const buyer = await User.findById(discussion.buyerId).lean().exec()
    const seller = await User.findById(discussion.sellerId).lean().exec()

    if (!buyer || !seller) {
      return NextResponse.json({ message: CANNOT_SEND_MSG }, { status: 409 })
    }

    if (!verifyCsrfTokens(request)) {
      return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
    }

    const contentLength = request.headers.get('content-length')

    if (contentLength !== null && contentLength !== '0') {
      let data = null

      try {
        data = await request.json()
      } catch (e) {
        return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
      }

      const result = validate(updateDiscussion, data)

      if ('message' in result) {
        return NextResponse.json({ message: result.message }, { status: 422 })
      }

      const discussion = (await Discussion.findByIdAndUpdate(
        discussionId,
        {
          $push: {
            messages: [{ message: result.value.message, userId: session.id }],
          },
        },
        { new: true }
      )
        .lean()
        .exec())!

      await pusher.trigger(
        discussion.channelName,
        'message:new',
        discussion.messages[discussion.messages.length - 1]
      )

      const isBuyer = session.id === buyer._id.toString()

      const sellerDiscussion = seller.discussions.find(
        (discussion) => discussion.id.toString() === discussionId
      )!

      const buyerDiscussion = buyer.discussions.find(
        (discussion) => discussion.id.toString() === discussionId
      )!

      if (isBuyer) {
        if (sellerDiscussion.hidden) {
          await pusher.trigger(seller.channelName, 'discussion:new', {
            ...discussion,
            hasNewMessage: true,
          })
        }

        if (buyerDiscussion.hidden) {
          await User.updateOne(
            { _id: buyer._id, 'discussions.id': discussionId },
            { $set: { 'discussions.$.hidden': false } }
          )
            .lean()
            .exec()
        }

        await User.updateOne(
          { _id: seller._id, 'discussions.id': discussionId },
          {
            $set: {
              'discussions.$.hidden': false,
              'discussions.$.hasNewMessage': true,
            },
          }
        )
          .lean()
          .exec()

        await pusher.trigger(seller.channelName, 'message:new', '')
      } else {
        if (buyerDiscussion.hidden) {
          await pusher.trigger(buyer.channelName, 'discussion:new', {
            ...discussion,
            hasNewMessage: true,
          })
        }

        if (sellerDiscussion.hidden) {
          await User.updateOne(
            { _id: seller._id, 'discussions.id': discussionId },
            { $set: { 'discussions.$.hidden': false } }
          )
            .lean()
            .exec()
        }

        await User.updateOne(
          { _id: buyer._id, 'discussions.id': discussionId },
          {
            $set: {
              'discussions.$.hidden': false,
              'discussions.$.hasNewMessage': true,
            },
          }
        )
          .lean()
          .exec()

        await pusher.trigger(buyer.channelName, 'message:new', '')
      }
    } else {
      for (let i = discussion.messages.length - 1; i >= 0; i--) {
        const message = discussion.messages[i]

        if (message.userId?.toString() !== session.id) {
          if (message.seen) {
            break
          }

          message.seen = true
        }
      }

      await Discussion.updateOne(
        { _id: discussionId },
        { $set: { messages: discussion.messages } }
      )
        .lean()
        .exec()

      await User.updateOne(
        { _id: session.id, 'discussions.id': discussionId },
        { $set: { 'discussions.$.hasNewMessage': false } }
      )
        .lean()
        .exec()
    }

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, segmentData: Params) {
  const params = await segmentData.params
  const discussionId = params.id

  if (!isValidObjectId(discussionId)) {
    return NextResponse.json({ message: PARAMS_INVALID }, { status: 422 })
  }

  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const discussion = await Discussion.findById(discussionId).lean().exec()

    if (!discussion) {
      return NextResponse.json(
        { message: DISCUSSION_NOT_FOUND },
        { status: 404 }
      )
    }

    if (
      session.id !== discussion.buyerId?.toString() &&
      session.id !== discussion.sellerId?.toString()
    ) {
      return NextResponse.json({ message: FORBIDDEN }, { status: 403 })
    }

    await Discussion.deleteOne({ _id: discussionId }).lean().exec()

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
