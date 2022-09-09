import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import forgotPwSchema from '../../schemas/forgotPwSchema'
import err from '../../utils/constants/errors'
import dbConnect from '../../utils/functions/dbConnect'
import catchError from '../../utils/functions/catchError'
import validate from '../../utils/functions/validate'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const result = validate(forgotPwSchema, req.body)

  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const { email } = result.value

  await dbConnect()

  const user = await User.findOne({ email }).lean().exec()

  if (!user) {
    return res.status(422).json({ message: err.EMAIL_UNKNOWN })
  }

  res.status(204).end()
}

export default catchError(handler)
