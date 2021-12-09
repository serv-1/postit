import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import dbConnect from '../../utils/dbConnect'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import Joi, { ValidationError } from 'joi'
import { loginSchema } from '../../utils/joiSchemas'
import {
  emailUsed,
  internalServerError,
  methodNotAllowed,
  passwordInvalid,
} from '../../utils/errors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: methodNotAllowed })
  }

  try {
    Joi.assert(req.body, loginSchema)
    const email = req.body.email
    const password = req.body.password

    await dbConnect()
    const user = await User.findOne({ email }).exec()

    if (!user) {
      return res.status(422).send({ message: emailUsed })
    }

    const [salt, key] = user.password.split(':')
    const keyBuffer = Buffer.from(key, 'hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)

    if (!crypto.timingSafeEqual(keyBuffer, derivedKey)) {
      return res.status(422).send({ message: passwordInvalid })
    }

    res.status(200).send({
      id: user._id,
      email: user.email,
    })
  } catch (e) {
    if (e instanceof ValidationError) {
      console.log(e)
      return res.status(422).send({ message: e.details[0].message })
    }
    res.status(500).send({ message: internalServerError })
  }
}
