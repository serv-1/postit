import User from 'models/User'
import { isValidObjectId } from 'mongoose'
import { NextResponse } from 'next/server'
import dbConnect from 'functions/dbConnect'
import {
  ID_INVALID,
  USER_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  const userId = params.id

  if (!isValidObjectId(userId)) {
    return NextResponse.json({ message: ID_INVALID }, { status: 422 })
  }

  try {
    await dbConnect()

    const user = await User.findById(userId).lean().exec()

    if (!user) {
      return NextResponse.json({ message: USER_NOT_FOUND }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: userId,
        name: user.name,
        email: user.email,
        channelName: user.channelName,
        image: user.image,
        postIds: user.postIds,
        favPostIds: user.favPostIds,
        discussions: user.discussions,
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
