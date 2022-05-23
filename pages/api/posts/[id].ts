import isBase64ValueTooBig from '../../../utils/functions/isBase64ValueTooBig'
import { isValidObjectId, Types, UpdateQuery } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import Post, { PostModel } from '../../../models/Post'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import { cwd } from 'process'
import { getSession } from 'next-auth/react'
import validate from '../../../utils/functions/validate'
import csrfTokenSchema from '../../../schemas/csrfTokenSchema'
import isCsrfTokenValid from '../../../utils/functions/isCsrfTokenValid'
import createFile from '../../../utils/functions/createFile'
import { unlink } from 'fs/promises'
import updatePostApiSchema, {
  UpdatePostApiSchema,
} from '../../../schemas/updatePostApiSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET': {
      await dbConnect()

      const post = await Post.aggregate(
        [
          { $match: { _id: new Types.ObjectId(id) } },
          {
            $lookup: {
              from: 'users',
              let: { userId: '$userId', postId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                {
                  $lookup: {
                    from: 'posts',
                    let: { postsIds: '$postsIds' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $ne: ['$_id', '$$postId'] },
                              { $in: ['$_id', '$$postsIds'] },
                            ],
                          },
                        },
                      },
                      {
                        $set: {
                          id: { $toString: '$_id' },
                          price: { $divide: ['$price', 100] },
                          image: {
                            $concat: [
                              '/static/images/posts/',
                              { $arrayElemAt: ['$images', 0] },
                            ],
                          },
                        },
                      },
                      {
                        $project: {
                          _id: 0,
                          id: 1,
                          name: 1,
                          price: 1,
                          image: 1,
                        },
                      },
                    ],
                    as: 'posts',
                  },
                },
                {
                  $set: {
                    id: { $toString: '$_id' },
                    image: {
                      $cond: [
                        { $regexMatch: { input: '$image', regex: /default/ } },
                        { $concat: ['/static/images/', '$image'] },
                        { $concat: ['/static/images/users/', '$image'] },
                      ],
                    },
                  },
                },
                {
                  $unset: ['_id', 'postsIds', '__v', 'password', 'favPostsIds'],
                },
              ],
              as: 'user',
            },
          },
          {
            $set: {
              id: { $toString: '$_id' },
              price: { $divide: ['$price', 100] },
              images: {
                $map: {
                  input: '$images',
                  as: 'image',
                  in: { $concat: ['/static/images/posts/', '$$image'] },
                },
              },
              user: { $arrayElemAt: ['$user', 0] },
            },
          },
          { $unset: ['_id', 'userId', '__v'] },
        ],
        {}
      ).exec()

      if (!post.length) {
        return res.status(404).json({ message: err.POST_NOT_FOUND })
      }

      res.status(200).json(post[0])
      break
    }
    case 'PUT': {
      const session = await getSession({ req })

      if (!session) {
        return res.status(403).json({ message: err.FORBIDDEN })
      }

      const result = validate(
        updatePostApiSchema,
        req.body as UpdatePostApiSchema
      )
      const reqBody = result.value

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const csrfTokenCookie = req.cookies['next-auth.csrf-token']

      if (!isCsrfTokenValid(csrfTokenCookie, reqBody.csrfToken)) {
        return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
      }

      const post = await Post.findById(id).lean().exec()

      if (!post) {
        return res.status(404).json({ message: err.POST_NOT_FOUND })
      }

      if (session.id !== post.userId.toString()) {
        return res.status(422).json({ message: err.PARAMS_INVALID })
      }

      const update: UpdateQuery<PostModel> = {}

      if (reqBody.images) {
        const images: string[] = []
        const path = '/public/static/images/posts/'

        for (const { base64, ext } of reqBody.images) {
          if (isBase64ValueTooBig(base64, 1000000)) {
            return res.status(413).json({ message: err.IMAGE_TOO_BIG })
          }

          const fname = await createFile(base64, ext, path, { enc: 'base64' })

          images.push(fname)
        }

        const post = await Post.findById(id).lean().exec()

        if (!post) {
          return res.status(404).json({ message: err.POST_NOT_FOUND })
        }

        for (const image of post.images) {
          await unlink(cwd() + path + image)
        }

        update.images = images
      }
      if (reqBody.price) update.price = reqBody.price * 100
      if (reqBody.name) update.name = reqBody.name
      if (reqBody.description) update.description = reqBody.description
      if (reqBody.categories) update.categories = reqBody.categories

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

      const post = await Post.findById(id).lean().exec()

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
