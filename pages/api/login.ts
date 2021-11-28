import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User'
import dbConnect from '../../utils/dbConnect'
import crypto from 'crypto'
import { Buffer } from 'buffer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({
      message: 'Request go brrr! Try to refresh the page and log in again.',
    })
  }

  const email = req.body.email
  const password = req.body.password

  try {
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
    res.status(500).send({
      message: 'Server go brrr! Try to refresh the page or just come later.',
    })
  }
}
