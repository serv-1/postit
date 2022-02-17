import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync } from 'crypto'
import dbConnect from '../../utils/functions/dbConnect'
import User from '../../models/User'
import { MongoError } from 'mongodb'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'
import { RegisterSchema, registerSchema } from '../../lib/joi/registerSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const result = validate(registerSchema, req.body as RegisterSchema)

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const { name, email, password } = result.value

  try {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')

    await dbConnect()
    const user = new User({ name, email, password: `${salt}:${hash}` })
    await user.save()

    res.status(200).end()
  } catch (e) {
    if ((e as MongoError).code === 11000) {
      return res.status(422).json({ message: err.EMAIL_USED, name: 'email' })
    }
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
