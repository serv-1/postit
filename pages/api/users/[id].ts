import { randomBytes, scryptSync } from 'crypto'
import Joi, { Schema, ValidationError } from 'joi'
import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import Account from '../../../models/Account'
import authCheck from '../../../utils/authCheck'
import dbConnect from '../../../utils/dbConnect'
import err from '../../../utils/errors'
import {
  emailCsrfSchema,
  nameCsrfSchema,
  passwordCsrfSchema,
} from '../../../utils/joiSchemas'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string
  if (!isValidObjectId(id)) {
    return res.status(422).send({ message: err.PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET':
      await dbConnect()
      const user = await User.findOne({ _id: id }).exec()

      if (!user) {
        return res.status(404).send({ message: err.USER_NOT_FOUND })
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
      const resp = await authCheck(req, id)
      if (resp) return res.status(resp.status).send({ message: resp.message })

      const key = Object.keys(req.body).reduce((prev, next) =>
        next !== 'csrfToken' ? next : prev
      )

      let update: Record<string, unknown>

      switch (key) {
        case 'name':
          validBody(res, req.body, nameCsrfSchema)
          update = { name: req.body.name }
          break
        case 'email': {
          validBody(res, req.body, emailCsrfSchema)
          update = { email: req.body.email }
          break
        }
        case 'password': {
          validBody(res, req.body, passwordCsrfSchema)
          const salt = randomBytes(16).toString('hex')
          const hash = scryptSync(req.body.password, salt, 64).toString('hex')
          update = { password: `${salt}:${hash}` }
          break
        }
        case 'image':
          type Image = { type?: string; base64Uri?: string }
          const { type, base64Uri }: Image = req.body.image

          if (!base64Uri || !type) {
            return res.status(422).send({ message: err.DATA_INVALID })
          }

          if (!['image/jpeg', 'image/png', 'image/gif'].includes(type)) {
            return res.status(422).send({ message: err.USER_IMAGE_INVALID })
          }

          if (base64Uri.search(/^data:image\/(jpeg|png|gif);base64,/) === -1) {
            return res.status(422).send({ message: err.DATA_INVALID })
          }

          const b64: string = base64Uri.split(',')[1]
          const pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0
          if (b64.length * (3 / 4) - pad > 1000000) {
            return res.status(413).send({ message: err.USER_IMAGE_TOO_LARGE })
          }

          const image = { data: Buffer.from(b64, 'base64'), contentType: type }
          update = { image }
          break
        default:
          return res.status(422).send({ message: err.DATA_INVALID })
      }

      try {
        await dbConnect()
        await User.updateOne({ _id: id }, update).exec()
      } catch (e) {
        res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    case 'DELETE': {
      const resp = await authCheck(req, id)
      if (resp) return res.status(resp.status).send({ message: resp.message })

      try {
        await dbConnect()
        await User.deleteOne({ _id: id }).exec()
        await Account.deleteOne({ userId: id }).exec()
      } catch (e) {
        res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    default:
      res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}

const validBody = (
  res: NextApiResponse,
  body: NextApiRequest['body'],
  schema: Schema
) => {
  try {
    Joi.assert(body, schema)
  } catch (e) {
    const message = (e as ValidationError).details[0].message
    res.status(422).send({ message })
  }
}
