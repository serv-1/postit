import User from 'models/User'
import { isValidObjectId } from 'mongoose'
import { NextResponse } from 'next/server'
import err from 'utils/constants/errors'
import dbConnect from 'utils/functions/dbConnect'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id

  if (!isValidObjectId(userId)) {
    return NextResponse.json({ message: err.ID_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const user = await User.findById(userId).lean().exec()

    if (!user) {
      return NextResponse.json({ message: err.USER_NOT_FOUND }, { status: 404 })
    }

    const postIds: string[] = []
    const favPostIds: string[] = []
    const discussionIds: string[] = []
    const max = Math.max(
      user.postIds.length,
      user.favPostIds.length,
      user.discussionIds.length
    )

    let i = 0

    while (i < max) {
      if (user.postIds[i]) {
        postIds.push(user.postIds[i].toString())
      }

      if (user.favPostIds[i]) {
        favPostIds.push(user.favPostIds[i].toString())
      }

      if (user.discussionIds[i]) {
        discussionIds.push(user.discussionIds[i].toString())
      }

      i++
    }

    return NextResponse.json(
      {
        id: userId,
        name: user.name,
        email: user.email,
        hasUnseenMessages: user.hasUnseenMessages,
        channelName: user.channelName,
        image: user.image,
        postIds,
        favPostIds,
        discussionIds,
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
