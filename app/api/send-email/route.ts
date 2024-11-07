import { DATA_INVALID, INTERNAL_SERVER_ERROR } from 'constants/errors'
import validate from 'functions/validate'
import { NextResponse } from 'next/server'
import sendResetPasswordLink from 'schemas/sendResetPasswordLink'
import mailjet from 'libs/mailjet'
import { randomBytes } from 'crypto'
import User from 'models/User'
import dbConnect from 'functions/dbConnect'
import Token from 'models/Token'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import hash from 'functions/hash'

export async function POST(request: Request) {
  let data = null

  try {
    data = await request.json()
  } catch (e) {
    return NextResponse.json({ message: DATA_INVALID }, { status: 422 })
  }

  const result = validate(sendResetPasswordLink, data)

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  const { email } = result.value
  const time = new Promise((resolve) => setTimeout(resolve, 500))

  try {
    await dbConnect()

    const user = await User.findOne({ email }).lean().exec()

    if (user) {
      const token = randomBytes(32).toString('hex')

      const tokenDoc = await Token.findOneAndUpdate(
        { userId: user._id },
        { token: hash(token) }
      )
        .lean()
        .exec()

      if (!tokenDoc) {
        await new Token({ userId: user._id, token: hash(token) }).save()
      }

      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: { Email: 'noreply@postit-site.vercel.app', Name: 'PostIt' },
            To: [{ Email: result.value.email }],
            Subject: 'Reset Password',
            HTMLPart: `Please click on this link to reset your password: <a href="${NEXT_PUBLIC_VERCEL_URL}/reset-password?token=${token}&userId=${user._id}">Reset Password</a>`,
          },
        ],
      })
    }
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }

  await time

  return new Response(null, { status: 204 })
}
