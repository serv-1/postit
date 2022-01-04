import Joi, { ValidationError } from 'joi'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import err from '../../utils/errors'
import { emailSchema } from '../../utils/joiSchemas'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  try {
    Joi.assert(req.body, emailSchema)
    const { email } = req.body

    const user = await User.findOne({ email }).exec()

    if (!user) return res.status(422).send({ message: err.EMAIL_UNKNOWN })

    res.status(200).end()
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(422).send({ message: e.details[0].message })
    }
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}
