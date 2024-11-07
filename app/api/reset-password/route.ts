import {
  DATA_INVALID,
  INTERNAL_SERVER_ERROR,
  TOKEN_INVALID,
  TOKEN_REQUIRED,
} from 'constants/errors'
import { scryptSync, timingSafeEqual } from 'crypto'
import dbConnect from 'functions/dbConnect'
import hash from 'functions/hash'
import validate from 'functions/validate'
import Token from 'models/Token'
import User from 'models/User'
import { NextResponse } from 'next/server'
import resetPassword from 'schemas/server/resetPassword'

export async function PUT(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(resetPassword, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  const { userId, password, token } = result.value

  try {
    await dbConnect()

    const tokenDoc = await Token.findOne({ userId }).lean().exec()

    if (!tokenDoc) {
      return NextResponse.json({ message: TOKEN_REQUIRED }, { status: 422 })
    }

    const [salt, key] = tokenDoc.token.split(':')
    const storedKey = Buffer.from(key, 'hex')
    const givenKey = scryptSync(token, salt, 64)

    if (!timingSafeEqual(storedKey, givenKey)) {
      return NextResponse.json({ message: TOKEN_INVALID }, { status: 422 })
    }

    await User.updateOne({ _id: userId }, { password: hash(password) })
      .lean()
      .exec()
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }

  return new Response(null, { status: 204 })
}
