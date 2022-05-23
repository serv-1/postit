import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import forgotPwSchema, { ForgotPwSchema } from '../../schemas/forgotPwSchema'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const result = validate(forgotPwSchema, req.body as ForgotPwSchema)

  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const { email } = result.value

  try {
    const user = await User.findOne({ email }).lean().exec()

    if (!user) {
      return res.status(422).json({ message: err.EMAIL_UNKNOWN })
    }

    res.status(200).end()
  } catch (e) {
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
