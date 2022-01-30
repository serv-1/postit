import isBase64ValueTooLarge from '../../../utils/functions/isBase64ValueTooLarge'
import { randomBytes, scryptSync } from 'crypto'
import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import Account from '../../../models/Account'
import authCheck from '../../../utils/functions/authCheck'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import { nameCsrfSchema } from '../../../lib/joi/nameSchema'
import { emailCsrfSchema } from '../../../lib/joi/emailSchema'
import { passwordCsrfSchema } from '../../../lib/joi/passwordSchema'
import imageSchema from '../../../lib/joi/imageSchema'
import validateSchema from '../../../utils/functions/validateSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string
  if (!isValidObjectId(id)) {
    return res.status(422).send({ message: err.PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET':
      await dbConnect()
      const user = await User.findOne({ _id: id }).lean().exec()

      if (!user) {
        return res.status(404).send({ message: err.USER_NOT_FOUND })
      }

      const base64 = user.image.data.toString('base64')

      res.status(200).send({
        id: user._id.toString(),
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
          validateSchema(nameCsrfSchema, req.body, res)
          update = { name: req.body.name }
          break
        case 'email': {
          validateSchema(emailCsrfSchema, req.body, res)
          update = { email: req.body.email }
          break
        }
        case 'password': {
          validateSchema(passwordCsrfSchema, req.body, res)
          const salt = randomBytes(16).toString('hex')
          const hash = scryptSync(req.body.password, salt, 64).toString('hex')
          update = { password: `${salt}:${hash}` }
          break
        }
        case 'image':
          const { error } = imageSchema.validate(req.body.image)
          if (error) {
            const { message, details } = error
            return res.status(422).send({ name: details[0].path[0], message })
          }

          const { type, base64Uri } = req.body.image

          if (!base64Uri.includes(',')) {
            return res.status(422).send({ message: err.DATA_INVALID })
          }

          if (isBase64ValueTooLarge(base64Uri, 1000000)) {
            return res.status(413).send({ message: err.IMAGE_TOO_LARGE })
          }

          update = {
            image: {
              data: Buffer.from(base64Uri.split(',')[1], 'base64'),
              contentType: type,
            },
          }
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

export default handler

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}
