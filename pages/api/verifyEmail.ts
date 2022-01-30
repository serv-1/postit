import { NextApiRequest, NextApiResponse } from 'next'
import forgotPasswordSchema from '../../lib/joi/forgotPasswordSchema'
import User from '../../models/User'
import err from '../../utils/constants/errors'
import validateSchema from '../../utils/functions/validateSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  validateSchema(forgotPasswordSchema, req.body, res)

  try {
    const user = await User.findOne({ email: req.body.email }).lean().exec()

    if (!user) return res.status(422).send({ message: err.EMAIL_UNKNOWN })

    res.status(200).end()
  } catch (e) {
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
