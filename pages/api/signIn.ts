import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import dbConnect from '../../utils/dbConnect'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import Joi, { ValidationError } from 'joi'
import { signInSchema } from '../../utils/joiSchemas'
import err from '../../utils/errors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  try {
    Joi.assert(req.body, signInSchema)
    const { email, password } = req.body

    await dbConnect()
    const user = await User.findOne({ email }).exec()

    if (!user) return res.status(422).send({ message: err.EMAIL_UNKNOWN })
    if (!user.password)
      return res.status(422).send({ message: err.EMAIL_GOOGLE })

    const [salt, hash] = user.password.split(':')
    const dbHash = Buffer.from(hash, 'hex')
    const givenHash = crypto.scryptSync(password, salt, 64)

    if (!crypto.timingSafeEqual(dbHash, givenHash)) {
      return res.status(422).send({ message: err.PASSWORD_INVALID })
    }

    res.status(200).send({
      id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(422).send({ message: e.details[0].message })
    }
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}
