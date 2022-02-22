import isBase64ValueTooBig from '../../../utils/functions/isBase64ValueTooBig'
import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import Post from '../../../models/Post'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import { cwd } from 'process'
import { getSession } from 'next-auth/react'
import validate from '../../../utils/functions/validate'
import { csrfTokenSchema } from '../../../lib/joi/csrfTokenSchema'
import isCsrfTokenValid from '../../../utils/functions/isCsrfTokenValid'
import createFile from '../../../utils/functions/createFile'
import { unlink } from 'fs/promises'
import { Categories } from '../../../types/common'
import {
  PostsIdPutSchema,
  postsIdPutSchema,
} from '../../../lib/joi/postsIdPutSchema'
import User from '../../../models/User'

type Update =
  | { name: string }
  | { description: string }
  | { categories: Categories[] }
  | { price: number }
  | { images: string[] }
  | undefined

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET': {
      await dbConnect()
      const post = await Post.findOne({ _id: id }).lean().exec()

      if (!post) {
        return res.status(404).json({ message: err.POST_NOT_FOUND })
      }

      res.status(200).json({
        id: post._id.toString(),
        name: post.name,
        description: post.description,
        categories: post.categories,
        price: post.price / 100,
        images: post.images.map((image) => '/static/images/posts/' + image),
        userId: post.userId.toString(),
      })
      break
    }
    case 'PUT': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      const result = validate(postsIdPutSchema, req.body as PostsIdPutSchema)
      const reqBody = result.value

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const csrfTokenCookie = req.cookies['next-auth.csrf-token']

      if (!isCsrfTokenValid(csrfTokenCookie, reqBody.csrfToken)) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      const post = await Post.findOne({ _id: id }).lean().exec()

      if (!post) {
        return res.status(404).json({ message: err.POST_NOT_FOUND })
      }

      if (session.id !== post.userId.toString()) {
        return res.status(422).json({ message: err.PARAMS_INVALID })
      }

      let update: Update

      if ('images' in reqBody) {
        const images: string[] = []
        const path = '/public/static/images/posts/'

        for (const { base64, type } of reqBody.images) {
          if (isBase64ValueTooBig(base64, 1000000)) {
            return res.status(413).json({ message: err.IMAGE_TOO_BIG })
          }

          const fname = await createFile(base64, type, path, 'base64')

          images.push(fname)
        }

        const post = await Post.findOne({ _id: id }).lean().exec()

        if (!post) {
          return res.status(404).json({ message: err.POST_NOT_FOUND })
        }

        for (const image of post.images) {
          await unlink(cwd() + path + image)
        }

        update = { images }
      } else if ('price' in reqBody) {
        update = { price: reqBody.price * 100 }
      } else if ('name' in reqBody) {
        update = { name: reqBody.name }
      } else if ('description' in reqBody) {
        update = { description: reqBody.description }
      } else if ('categories' in reqBody) {
        update = { categories: reqBody.categories }
      }

      try {
        await dbConnect()
        await Post.updateOne({ _id: id }, update).exec()
      } catch (e) {
        res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    case 'DELETE': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      const csrfToken: string | undefined = req.body?.csrfToken
      const result = validate(csrfTokenSchema, csrfToken)

      if ('message' in result) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      const csrfTokenCookie = req.cookies['next-auth.csrf-token']

      if (!isCsrfTokenValid(csrfTokenCookie, result.value)) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      const post = await Post.findOne({ _id: id }).lean().exec()

      if (!post) {
        return res.status(404).json({ message: err.POST_NOT_FOUND })
      }

      if (session.id !== post.userId.toString()) {
        return res.status(422).json({ message: err.PARAMS_INVALID })
      }

      for (const image of post.images) {
        await unlink(cwd() + '/public/static/images/posts/' + image)
      }

      try {
        await dbConnect()
        await Post.deleteOne({ _id: id }).exec()
        await User.findByIdAndUpdate(session.id, { $pull: { postsIds: id } })
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
      sizeLimit: '7mb',
    },
  },
}
