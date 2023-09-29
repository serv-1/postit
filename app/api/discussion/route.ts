import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import validate from 'functions/validate'
import createDiscussion from 'schemas/server/createDiscussion'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import Discussion from 'models/Discussion'
import dbConnect from 'functions/dbConnect'
import User from 'models/User'
import getServerPusher from 'functions/getServerPusher'
import {
  CSRF_TOKEN_INVALID,
  DATA_INVALID,
  DISCUSSION_ALREADY_EXISTS,
  ID_INVALID,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from 'constants/errors'

export async function POST(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(createDiscussion, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  const { sellerId, postId, message, postName } = result.value

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  if (sellerId === session.id) {
    return NextResponse.json({ message: ID_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const discussion = await Discussion.findOne({ buyerId: session.id, postId })
      .lean()
      .exec()

    if (discussion) {
      return NextResponse.json(
        { message: DISCUSSION_ALREADY_EXISTS },
        { status: 409 }
      )
    }

    const { _id } = await new Discussion({
      messages: [{ message, userId: session.id }],
      buyerId: session.id,
      sellerId,
      postName,
      postId,
    }).save()

    const seller = await User.findById(sellerId).lean().exec()

    if (!seller) {
      return NextResponse.json({ message: USER_NOT_FOUND }, { status: 404 })
    }

    await getServerPusher().trigger(
      ['private-' + session.channelName, 'private-' + seller.channelName],
      'discussion-created',
      { discussionId: _id, userId: session.id }
    )

    return NextResponse.json({ id: _id }, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
