import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import dbConnect from '../../utils/functions/dbConnect'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import err from '../../utils/constants/errors'
import signInSchema from '../../lib/joi/signInSchema'
import validateSchema from '../../utils/functions/validateSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  validateSchema(signInSchema, req.body, res)

  const { email, password } = req.body

  try {
    await dbConnect()
    const user = await User.findOne({ email }).exec()

    if (!user) {
      return res.status(422).send({ message: err.EMAIL_UNKNOWN })
    }

    const [salt, hash] = (user.password as string).split(':')
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
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
