import { randomBytes, scryptSync } from 'crypto'
import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import { authCheck } from '../../../utils'
import dbConnect from '../../../utils/dbConnect'
import {
  DATA_INVALID,
  EMAIL_INVALID,
  INTERNAL_SERVER_ERROR,
  METHOD_NOT_ALLOWED,
  NAME_INVALID,
  PARAMS_INVALID,
  PASSWORD_INVALID,
  USER_IMAGE_INVALID,
  USER_IMAGE_TOO_LARGE,
  USER_NOT_FOUND,
} from '../../../utils/errors'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string
  if (!isValidObjectId(id)) {
    return res.status(422).send({ message: PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET':
      const user = await User.findOne({ _id: id }).exec()

      if (!user) {
        return res.status(404).send({ message: USER_NOT_FOUND })
      }

      const base64 = user.image.data.toString('base64')

      res.status(200).send({
        id: user.id,
        name: user.name,
        email: user.email,
        image: `data:${user.image.contentType};base64,${base64}`,
      })
      break
    case 'PUT':
      const err = await authCheck(req, id)
      if (err) return res.status(err.status).send({ message: err.message })

      const key = Object.keys(req.body)[0]
      let update: Record<string, unknown>

      switch (key) {
        case 'name':
          const name = req.body.name

          if (typeof name !== 'string') {
            return res.status(422).send({ message: NAME_INVALID })
          }

          update = req.body
          break
        case 'email':
          const email = req.body.email

          if (typeof email !== 'string') {
            return res.status(422).send({ message: EMAIL_INVALID })
          }

          update = req.body
          break
        case 'password':
          const password = req.body.password

          if (typeof password !== 'string') {
            return res.status(422).send({ message: PASSWORD_INVALID })
          }

          const salt = randomBytes(16).toString('hex')
          const hash = scryptSync(password, salt, 64).toString('hex')

          update = { password: `${salt}:${hash}` }
          break
        case 'image':
          type Image = { type?: string; base64Uri?: string }
          const { type, base64Uri }: Image = req.body.image

          if (!base64Uri || !type) {
            return res.status(422).send({ message: DATA_INVALID })
          }

          if (!['image/jpeg', 'image/png', 'image/gif'].includes(type)) {
            return res.status(422).send({ message: USER_IMAGE_INVALID })
          }

          if (base64Uri.search(/^data:image\/(jpeg|png|gif);base64,/) === -1) {
            return res.status(422).send({ message: DATA_INVALID })
          }

          const b64: string = base64Uri.split(',')[1]
          const pad =
            b64.slice(-1) == '=' ? 1 : 0 + b64.slice(-2) == '=' ? 1 : 0
          if (b64.length * (3 / 4) - pad > 1000000) {
            return res.status(413).send({ message: USER_IMAGE_TOO_LARGE })
          }

          update = {
            image: { data: Buffer.from(b64, 'base64'), contentType: type },
          }
          break
        default:
          return res.status(422).send({ message: DATA_INVALID })
      }

      try {
        await dbConnect()
        await User.updateOne({ _id: id }, update).exec()
      } catch (e) {
        res.status(500).send({ message: INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    case 'DELETE': {
      const err = await authCheck(req, id)
      if (err) return res.status(err.status).send({ message: err.message })

      try {
        await dbConnect()
        await User.deleteOne({ _id: id }).exec()
      } catch (e) {
        res.status(500).send({ message: INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    default:
      res.status(405).send({ message: METHOD_NOT_ALLOWED })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}
