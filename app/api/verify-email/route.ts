import User from 'models/User'
import { NextResponse } from 'next/server'
import forgotPwSchema from 'schemas/forgotPwSchema'
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

  const result = validate(forgotPwSchema, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  try {
    await dbConnect()

    const user = await User.findOne({ email: result.value.email }).lean().exec()

    if (!user) {
      return NextResponse.json({ message: err.EMAIL_UNKNOWN }, { status: 422 })
    }

    return new Response(null, { status: 204 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
