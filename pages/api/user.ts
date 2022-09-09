import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync } from 'crypto'
import dbConnect from '../../utils/functions/dbConnect'
import User, { UserModel } from '../../models/User'
import { MongoError } from 'mongodb'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'
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
import getSessionAndUser from '../../utils/functions/getSessionAndUser'
import catchError from '../../utils/functions/catchError'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  if (req.method === 'POST') {
    const result = validate(addUserSchema, req.body)

    if ('message' in result) {
      const { name, message } = result
      return res.status(422).json({ name, message })
    }

    await dbConnect()

    try {
      const user = await new User(result.value).save()

      res.setHeader('Location', '/profile')
      return res.status(201).json({ id: user._id.toString() })
    } catch (e) {
      if ((e as MongoError).code === 11000) {
        return res.status(422).json({ message: err.EMAIL_USED, name: 'email' })
      }
      throw null
    }
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const result = validate<string>(csrfTokenSchema, req.body?.csrfToken)
  const csrfTokenCookie = req.cookies['next-auth.csrf-token']

  if (!result.value || !isCsrfTokenValid(csrfTokenCookie, result.value)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  if (req.method === 'PUT') {
    const result = validate(updateUserApiSchema, req.body)

    if ('message' in result) {
      return res.status(422).json({ message: result.message })
    }

    const reqBody = result.value
    let update: UpdateQuery<UserModel> = {}

    if ('name' in reqBody) {
      update = { name: reqBody.name }
    } else if ('email' in reqBody) {
      update = { email: reqBody.email }
    } else if ('password' in reqBody) {
      const salt = randomBytes(16).toString('hex')
      const hash = scryptSync(reqBody.password, salt, 64)

      update = { password: salt + ':' + hash.toString('hex') }
    } else if ('image' in reqBody) {
      const { ext, base64 } = reqBody.image

      if (isBase64ValueTooBig(base64, 1000000)) {
        return res.status(413).json({ message: err.IMAGE_TOO_BIG })
      }

      const path = '/public/static/images/users/'

      if (user.image.split('.')[0] !== 'default') {
        await unlink(cwd() + path + user.image)
      }

      const fname = await createFile(base64, ext, path, { enc: 'base64' })

      update = { image: fname }
    } else if ('favPostId' in reqBody) {
      const ids = user.favPostsIds.map((id) => id.toString())
      const action = ids.includes(reqBody.favPostId) ? 'pull' : 'push'

      update = { [`$${action}`]: { favPostsIds: reqBody.favPostId } }
    } else if ('discussionId' in reqBody) {
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

    try {
      await User.updateOne({ _id: session.id }, update, {
        runValidators: true,
      })
        .lean()
        .exec()
    } catch (e) {
      if ((e as MongoError).code === 11000) {
        return res.status(422).json({ message: err.EMAIL_USED })
      }
      throw null
    }

    return res.status(204).end()
  }

  if (user.image.split('.')[0] !== 'default') {
    await unlink(cwd() + '/public/static/images/users/' + user.image)
  }

  await dbConnect()
  await User.deleteOne({ _id: session.id }).lean().exec()

  res.status(204).end()
}

export default catchError(handler)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}
