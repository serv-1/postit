import isBase64ValueTooBig from '../../../utils/functions/isBase64ValueTooBig'
import { randomBytes, scryptSync } from 'crypto'
import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import Account from '../../../models/Account'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import { cwd } from 'process'
import validate from '../../../utils/functions/validate'
import { getSession } from 'next-auth/react'
import isCsrfTokenValid from '../../../utils/functions/isCsrfTokenValid'
import { csrfTokenSchema } from '../../../lib/joi/csrfTokenSchema'
import createFile from '../../../utils/functions/createFile'
import { unlink } from 'fs/promises'
import {
  UsersIdPutSchema,
  usersIdPutSchema,
} from '../../../lib/joi/usersIdPutSchema'

type Update =
  | { name: string }
  | { email: string }
  | { password: string }
  | { image: string }
  | undefined

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET':
      await dbConnect()
      const user = await User.findOne({ _id: id }).lean().exec()

      if (!user) {
        return res.status(404).json({ message: err.USER_NOT_FOUND })
      }

      const fname = user.image.split('.')[0]
      const path = '/static/images' + (fname === 'default' ? '/' : '/users/')

      res.status(200).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: path + user.image,
      })
      break
    case 'PUT':
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      if (id !== session.id) {
        return res.status(422).json({ message: err.PARAMS_INVALID })
      }

      const result = validate(usersIdPutSchema, req.body as UsersIdPutSchema)
      const reqBody = result.value

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const csrfTokenCookie = req.cookies['next-auth.csrf-token']

      if (!isCsrfTokenValid(csrfTokenCookie, reqBody.csrfToken)) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      let update: Update

      if ('image' in reqBody) {
        const { type, base64 } = reqBody.image

        if (isBase64ValueTooBig(base64, 1000000)) {
          return res.status(413).json({ message: err.IMAGE_TOO_BIG })
        }

        const user = await User.findOne({ _id: id }).lean().exec()

        if (!user) {
          return res.status(404).json({ message: err.USER_NOT_FOUND })
        }

        const path = '/public/static/images/users/'

        if (user.image.split('.')[0] !== 'default') {
          await unlink(cwd() + path + user.image)
        }

        const fname = await createFile(base64, type, path, 'base64')

        update = { image: fname }
      } else if ('password' in reqBody) {
        const salt = randomBytes(16).toString('hex')
        const hash = scryptSync(reqBody.password, salt, 64)

        update = { password: `${salt}:${hash.toString('hex')}` }
      } else if ('name' in reqBody) {
        update = { name: reqBody.name }
      } else if ('email' in reqBody) {
        update = { email: reqBody.email }
      }

      try {
        await dbConnect()
        await User.updateOne({ _id: id }, update).exec()
      } catch (e) {
        res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    case 'DELETE': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      if (id !== session.id) {
        return res.status(422).json({ message: err.PARAMS_INVALID })
      }

      const csrfToken = req.body?.csrfToken as string | undefined
      const result = validate(csrfTokenSchema, csrfToken)

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const csrfTokenCookie = req.cookies['next-auth.csrf-token']

      if (!isCsrfTokenValid(csrfTokenCookie, result.value)) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      const user = await User.findOne({ _id: id }).lean().exec()

      if (!user) {
        return res.status(404).json({ message: err.USER_NOT_FOUND })
      }

      if (user.image.split('.')[0] !== 'default') {
        await unlink(cwd() + '/public/static/images/users/' + user.image)
      }

      try {
        await dbConnect()
        await User.deleteOne({ _id: id }).exec()
        await Account.deleteOne({ userId: id }).exec()
      } catch (e) {
        res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    default:
      res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
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
