import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import dbConnect from '../../utils/dbConnect'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import Joi, { ValidationError } from 'joi'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({
      message: 'Request go brrr! Try to refresh the page and log in again.',
    })
  }

  const validationErrMsg = 'The email and/or the password are invalid.'

  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .messages({
        'string.base': validationErrMsg,
        'string.empty': validationErrMsg,
        'string.email': validationErrMsg,
        'any.required': validationErrMsg,
      }),
    password: Joi.string().required().messages({
      'string.base': validationErrMsg,
      'string.empty': validationErrMsg,
      'any.required': validationErrMsg,
    }),
  })
    .required()
    .messages({
      'object.base': validationErrMsg,
      'object.required': validationErrMsg,
    })

  try {
    Joi.assert(req.body, schema)
    const email = req.body.email
    const password = req.body.password

    await dbConnect()
    const user = await User.findOne({ email }).exec()

    if (!user) {
      return res.status(422).send({
        message: 'This email is not registered.',
      })
    }

    const [salt, key] = user.password.split(':')
    const keyBuffer = Buffer.from(key, 'hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)

    if (!crypto.timingSafeEqual(keyBuffer, derivedKey)) {
      return res.status(422).send({
        message: 'This password is invalid.',
      })
    }

    res.status(200).send({
      id: user._id,
      email: user.email,
    })
  } catch (e) {
    if (e instanceof ValidationError) {
      console.log(e)
      return res.status(422).send({
        message: e.details[0].message,
      })
    }
    res.status(500).send({
      message: 'Server go brrr! Try to refresh the page or just come later.',
    })
  }
}
