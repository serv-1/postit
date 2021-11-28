import Joi, { ValidationError } from 'joi'
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import dbConnect from '../../utils/dbConnect'
import User from '../../models/User'
import { NativeError } from 'mongoose'
import { MongoServerError } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.base': 'The email is not valid.',
          'string.empty': 'The email cannot be empty.',
          'string.email': 'The email is not valid.',
          'any.required': 'The email is required.',
        }),
      password: Joi.string()
        .invalid(Joi.ref('email'))
        .min(10)
        .max(20)
        .required()
        .messages({
          'string.base': 'The password is not valid.',
          'string.empty': 'The password cannot be empty.',
          'any.invalid': 'The password cannot be the same as email.',
          'string.min': 'The password must have 10 characters.',
          'string.max': 'The password cannot exceed 20 characters.',
          'any.required': 'The password is required.',
        }),
    })

    try {
      Joi.assert(req.body, schema)
      const salt = crypto.randomBytes(16).toString('hex')
      const derivedKey = crypto.scryptSync(req.body.password, salt, 64)
      const hash = derivedKey.toString('hex')

      await dbConnect()
      const user = new User({
        email: req.body.email,
        password: `${salt}:${hash}`,
      })

      await user.save()

      res.status(200).end()
    } catch (e) {
      if (e instanceof ValidationError) {
        return res
          .status(422)
          .send({ message: e.details[0].message, name: e.details[0].path[0] })
      } else if (
        (e as NativeError).name === 'MongoServerError' &&
        (e as MongoServerError).code === 11000
      ) {
        return res
          .status(422)
          .send({ message: 'This email is already used.', name: 'email' })
      }
      return res.status(500).send({
        message: 'Server go brrr! Try to refresh the page or just come later.',
      })
    }
  } else {
    return res.status(405).send({
      message: 'Request go brrr! Try to refresh the page and sign up again.',
    })
  }
}
