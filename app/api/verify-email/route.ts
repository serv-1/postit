import User from 'models/User'
import { NextResponse } from 'next/server'
import forgotPassword from 'schemas/forgotPassword'
import dbConnect from 'functions/dbConnect'
import validate from 'functions/validate'
import {
  DATA_INVALID,
  EMAIL_UNKNOWN,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

export async function POST(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(forgotPassword, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  try {
    await dbConnect()

    const user = await User.findOne({ email: result.value.email }).lean().exec()

    if (!user) {
      return NextResponse.json({ message: EMAIL_UNKNOWN }, { status: 422 })
    }

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
