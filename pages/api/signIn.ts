import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import dbConnect from '../../utils/functions/dbConnect'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import err from '../../utils/constants/errors'
import signInSchema, { SignInSchema } from '../../schemas/signInSchema'
import validate from '../../utils/functions/validate'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const result = validate(signInSchema, req.body as SignInSchema)

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const { email, password } = result.value

  try {
    await dbConnect()
    const user = await User.findOne({ email }).exec()

    if (!user) {
      return res.status(422).json({ name: 'email', message: err.EMAIL_UNKNOWN })
    }

    const [salt, hash] = (user.password as string).split(':')
    const dbHash = Buffer.from(hash, 'hex')
    const givenHash = crypto.scryptSync(password, salt, 64)

    if (!crypto.timingSafeEqual(dbHash, givenHash)) {
      const json = { name: 'password', message: err.PASSWORD_INVALID }
      return res.status(422).json(json)
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (e) {
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
