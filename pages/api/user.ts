import Joi, { ValidationError } from 'joi'
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync } from 'crypto'
import dbConnect from '../../utils/dbConnect'
import User from '../../models/User'
import { MongoError } from 'mongodb'
import { registerSchema } from '../../utils/joiSchemas'
import err from '../../utils/errors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  try {
    Joi.assert(req.body, registerSchema)
    const { name, email, password } = req.body

    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')

    await dbConnect()
    const user = new User({ name, email, password: `${salt}:${hash}` })
    await user.save()

    res.status(200).end()
  } catch (e) {
    if (e instanceof ValidationError) {
      const { message, path } = e.details[0]
      return res.status(422).send({ message, name: path[0] })
    } else if ((e as MongoError).code === 11000) {
      return res.status(422).send({ message: err.EMAIL_USED, name: 'email' })
    }
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}
