import { scryptSync, timingSafeEqual } from 'crypto'
import User from 'models/User'
import { NextResponse } from 'next/server'
import signInSchema from 'schemas/signInSchema'
import err from 'utils/constants/errors'
import dbConnect from 'utils/functions/dbConnect'
import validate from 'utils/functions/validate'

export async function POST(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: err.DATA_INVALID }, { status: 422 })
  }

  const result = validate(signInSchema, data)

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
        { name: 'email', message: err.EMAIL_UNKNOWN },
        { status: 422 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { name: 'password', message: err.PASSWORD_REQUIRED },
        { status: 422 }
      )
    }

    const [salt, hash] = user.password.split(':')
    const dbHash = Buffer.from(hash, 'hex')
    const givenHash = scryptSync(password, salt, 64)

    if (!timingSafeEqual(dbHash, givenHash)) {
      return NextResponse.json(
        { name: 'password', message: err.PASSWORD_INVALID },
        { status: 422 }
      )
    }

    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      {
        status: 200,
      }
    )
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
