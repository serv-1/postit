import { scryptSync, timingSafeEqual } from 'crypto'
import User from 'models/User'
import { NextResponse } from 'next/server'
import signIn from 'schemas/signIn'
import dbConnect from 'functions/dbConnect'
import validate from 'functions/validate'
import {
  DATA_INVALID,
  EMAIL_UNKNOWN,
  PASSWORD_REQUIRED,
  PASSWORD_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

export async function POST(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(signIn, data)

  if ('message' in result) {
    return NextResponse.json(
      { name: result.name, message: result.message },
      { status: 422 }
    )
  }

  const { email, password } = result.value

  try {
    await dbConnect()

    const user = await User.findOne({ email }).lean().exec()

    if (!user) {
      return NextResponse.json(
        { name: 'email', message: EMAIL_UNKNOWN },
        { status: 422 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { name: 'password', message: PASSWORD_REQUIRED },
        { status: 422 }
      )
    }

    const [salt, hash] = user.password.split(':')
    const dbHash = Buffer.from(hash, 'hex')
    const givenHash = scryptSync(password, salt, 64)

    if (!timingSafeEqual(dbHash, givenHash)) {
      return NextResponse.json(
        { name: 'password', message: PASSWORD_INVALID },
        { status: 422 }
      )
    }

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      {
        status: 200,
      }
    )
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
