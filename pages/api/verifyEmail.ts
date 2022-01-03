import Joi, { ValidationError } from 'joi'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import {
  EMAIL_UNKNOWN,
  INTERNAL_SERVER_ERROR,
  METHOD_NOT_ALLOWED,
} from '../../utils/errors'
import { emailSchema } from '../../utils/joiSchemas'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: METHOD_NOT_ALLOWED })
  }

  try {
    Joi.assert(req.body, emailSchema)
    const { email } = req.body

    const user = await User.findOne({ email }).exec()

    if (!user) return res.status(422).send({ message: EMAIL_UNKNOWN })

    res.status(200).end()
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(422).send({ message: e.details[0].message })
    }
    res.status(500).send({ message: INTERNAL_SERVER_ERROR })
  }
}
