import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync } from 'crypto'
import dbConnect from '../../utils/functions/dbConnect'
import User from '../../models/User'
import { MongoError } from 'mongodb'
import err from '../../utils/constants/errors'
import registerSchema from '../../lib/joi/registerSchema'
import validateSchema from '../../utils/functions/validateSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  validateSchema(registerSchema, req.body, res, true)

  const { name, email, password } = req.body

  try {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')

    await dbConnect()
    const user = new User({ name, email, password: `${salt}:${hash}` })
    await user.save()

    res.status(200).end()
  } catch (e) {
    if ((e as MongoError).code === 11000) {
      return res.status(422).send({ message: err.EMAIL_USED, name: 'email' })
    }
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
