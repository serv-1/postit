import Joi, { ValidationError } from 'joi'
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import dbConnect from '../../utils/dbConnect'
import User from '../../models/User'
import { NativeError } from 'mongoose'
import { MongoServerError } from 'mongodb'
import { signupSchema } from '../../utils/joiSchemas'
import {
  emailUsed,
  internalServerError,
  methodNotAllowed,
} from '../../utils/errors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      Joi.assert(req.body, signupSchema)
      const salt = crypto.randomBytes(16).toString('hex')
      const derivedKey = crypto.scryptSync(req.body.password, salt, 64)
      const hash = derivedKey.toString('hex')

      await dbConnect()
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: `${salt}:${hash}`,
      })

      await user.save()

      res.status(200).end()
    } catch (e) {
      if (e instanceof ValidationError) {
        const name = e.details[0].path[0]
        const message = e.details[0].message

        // let resErr: { message: string; name?: string } = { message }

        // if (name === 'email' || name === 'password') resErr.name = name

        // return res.status(422).send(resErr)
        return res.status(422).send({ message, name })
      } else if (
        (e as NativeError).name === 'MongoServerError' &&
        (e as MongoServerError).code === 11000
      ) {
        return res.status(422).send({ message: emailUsed, name: 'email' })
      }
      res.status(500).send({
        message: internalServerError,
      })
    }
  } else {
    res.status(405).send({
      message: methodNotAllowed,
    })
  }
}
