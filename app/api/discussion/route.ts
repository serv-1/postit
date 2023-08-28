import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { nextAuthOptions } from '../auth/[...nextauth]/route'
import err from 'utils/constants/errors'
import validate from 'utils/functions/validate'
import addDiscussionApiSchema from 'schemas/addDiscussionApiSchema'
import verifyCsrfTokens from 'utils/functions/verifyCsrfTokens'
import Discussion from 'models/Discussion'
import dbConnect from 'utils/functions/dbConnect'
import User from 'models/User'
import getServerPusher from 'utils/functions/getServerPusher'

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

  const result = validate(addDiscussionApiSchema, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  const { sellerId, postId, message, postName } = result.value

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  if (sellerId === session.id) {
    return NextResponse.json({ message: err.ID_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const discussion = await Discussion.findOne({ buyerId: session.id, postId })
      .lean()
      .exec()

    if (discussion) {
      return NextResponse.json(
        { message: err.DISCUSSION_ALREADY_EXISTS },
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
      return NextResponse.json({ message: err.USER_NOT_FOUND }, { status: 404 })
    }

    await getServerPusher().trigger(
      ['private-' + session.channelName, 'private-' + seller.channelName],
      'discussion-created',
      { discussionId: _id, userId: session.id }
    )

    return NextResponse.json({ id: _id }, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
