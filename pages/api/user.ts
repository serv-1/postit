import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync } from 'crypto'
import dbConnect from '../../utils/functions/dbConnect'
import User, { UserModel } from '../../models/User'
import { MongoError } from 'mongodb'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'
import { getSession } from 'next-auth/react'
import updateUserApiSchema from '../../schemas/updateUserApiSchema'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import isBase64ValueTooBig from '../../utils/functions/isBase64ValueTooBig'
import { unlink } from 'fs/promises'
import { cwd } from 'process'
import createFile from '../../utils/functions/createFile'
import csrfTokenSchema from '../../schemas/csrfTokenSchema'
import { UpdateQuery } from 'mongoose'
import addUserSchema from '../../schemas/addUserSchema'
import getServerPusher from '../../utils/functions/getServerPusher'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'PUT': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      const result = validate(updateUserApiSchema, req.body)

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const reqBody = result.value
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
        const user = await User.findById(session.id).lean().exec()

        if (!user) {
          return res.status(404).json({ message: err.USER_NOT_FOUND })
        }

        const ids = user.favPostsIds.map((id) => id.toString())
        const action = ids.includes(reqBody.favPostId) ? 'pull' : 'push'

        update = { [`$${action}`]: { favPostsIds: reqBody.favPostId } }
      } else if ('discussionId' in reqBody) {
        const user = await User.findById(session.id).lean().exec()

        if (!user) {
          return res.status(404).json({ message: err.USER_NOT_FOUND })
        }

        const ids = user.discussionsIds.map((id) => id.toString())
        const action = ids.includes(reqBody.discussionId) ? 'pull' : 'push'

        update = {
          [`$${action}`]: { discussionsIds: reqBody.discussionId },
          hasUnseenMessages: false,
        }

        const pusher = getServerPusher()
        pusher.trigger(
          'private-' + user.channelName,
          'discussion-deleted',
          reqBody.discussionId
        )
      }

      await dbConnect()
      await User.updateOne({ _id: session.id }, update).exec()

      res.status(200).end()
      break
    }
    case 'POST': {
      const result = validate(addUserSchema, req.body)

      if ('message' in result) {
        const { name, message } = result
        return res.status(422).json({ name, message })
      }

      await dbConnect()

      try {
        await new User(result.value).save()

        res.setHeader('Location', '/profile')
        res.status(201).end()
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

      const result = validate<string>(csrfTokenSchema, req.body?.csrfToken)

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

      await dbConnect()
      await User.deleteOne({ _id: session.id }).exec()

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
