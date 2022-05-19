import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync } from 'crypto'
import dbConnect from '../../utils/functions/dbConnect'
import User, { UserModel } from '../../models/User'
import { MongoError } from 'mongodb'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'
import { RegisterSchema, registerSchema } from '../../lib/joi/registerSchema'
import { getSession } from 'next-auth/react'
import { UserPutSchema, userPutSchema } from '../../lib/joi/userPutSchema'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import isBase64ValueTooBig from '../../utils/functions/isBase64ValueTooBig'
import { unlink } from 'fs/promises'
import { cwd } from 'process'
import createFile from '../../utils/functions/createFile'
import { csrfTokenSchema } from '../../lib/joi/csrfTokenSchema'
import { UpdateQuery } from 'mongoose'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'PUT': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      const result = validate(userPutSchema, req.body as UserPutSchema)
      const reqBody = result.value

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const csrfTokenCookie = req.cookies['next-auth.csrf-token']

      if (!isCsrfTokenValid(csrfTokenCookie, reqBody.csrfToken)) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      let update: UpdateQuery<UserModel> = {}

      if ('image' in reqBody) {
        const { ext, base64 } = reqBody.image

        if (isBase64ValueTooBig(base64, 1000000)) {
          return res.status(413).json({ message: err.IMAGE_TOO_BIG })
        }

        const user = await User.findById(session.id).lean().exec()

        if (!user) {
          return res.status(404).json({ message: err.USER_NOT_FOUND })
        }

        const path = '/public/static/images/users/'

        if (user.image.split('.')[0] !== 'default') {
          await unlink(cwd() + path + user.image)
        }

        const fname = await createFile(base64, ext, path, { enc: 'base64' })

        update = { image: fname }
      } else if ('password' in reqBody) {
        const salt = randomBytes(16).toString('hex')
        const hash = scryptSync(reqBody.password, salt, 64)

        update = { password: `${salt}:${hash.toString('hex')}` }
      } else if ('name' in reqBody) {
        update = { name: reqBody.name }
      } else if ('email' in reqBody) {
        update = { email: reqBody.email }
      } else if ('favPostId' in reqBody) {
        update = { [`$${reqBody.action}`]: { favPostsIds: reqBody.favPostId } }
      }

      try {
        await dbConnect()
        await User.updateOne({ _id: session.id }, update).exec()
      } catch (e) {
        res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    case 'POST': {
      const result = validate(registerSchema, req.body as RegisterSchema)

      if ('message' in result) {
        const { name, message } = result
        return res.status(422).json({ name, message })
      }

      try {
        await dbConnect()
        await new User(result.value).save()
        res.status(200).end()
      } catch (e) {
        if ((e as MongoError).code === 11000) {
          const json = { message: err.EMAIL_USED, name: 'email' }
          return res.status(422).json(json)
        }
        res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
      }
      break
    }
    case 'DELETE': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
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

      const user = await User.findById(session.id).lean().exec()

      if (!user) {
        return res.status(404).json({ message: err.USER_NOT_FOUND })
      }

      if (user.image.split('.')[0] !== 'default') {
        await unlink(cwd() + '/public/static/images/users/' + user.image)
      }

      try {
        await dbConnect()
        await User.deleteOne({ _id: session.id }).exec()
      } catch (e) {
        res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    default:
      return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
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
