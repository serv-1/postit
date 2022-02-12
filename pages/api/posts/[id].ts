import isBase64ValueTooLarge from '../../../utils/functions/isBase64ValueTooLarge'
import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import Post from '../../../models/Post'
import authCheck from '../../../utils/functions/authCheck'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import validateSchema from '../../../utils/functions/validateSchema'
import { nanoid } from 'nanoid'
import { cwd } from 'process'
import { appendFile, unlink } from 'fs/promises'
import { Buffer } from 'buffer'
import { getSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { nameCsrfSchema } from '../../../lib/joi/nameSchema'
import { descriptionCsrfSchema } from '../../../lib/joi/descritptionSchema'
import { reqCategoriesCsrfSchema } from '../../../lib/joi/categoriesSchema'
import { reqPriceCsrfSchema } from '../../../lib/joi/priceSchema'
import { imagesArrayCsrfSchema } from '../../../lib/joi/imagesSchema'
import { Image } from '../../../types/common'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string
  if (!isValidObjectId(id)) {
    return res.status(422).send({ message: err.PARAMS_INVALID })
  }

  switch (req.method) {
    case 'GET':
      await dbConnect()
      const post = await Post.findOne({ _id: id }).lean().exec()

      if (!post) {
        return res.status(404).send({ message: err.POST_NOT_FOUND })
      }

      res.status(200).send({
        id: post._id.toString(),
        name: post.name,
        description: post.description,
        categories: post.categories,
        price: post.price / 100,
        images: post.images,
        userId: post.userId.toString(),
      })
      break
    case 'PUT': {
      const resp = await authCheck(req)
      if (resp) return res.status(resp.status).send({ message: resp.message })

      const session = (await getSession({ req })) as Session

      const post = await Post.findOne({ _id: id }).lean().exec()

      if (!post) {
        return res.status(404).send({ message: err.POST_NOT_FOUND })
      }

      if (session.id !== post.userId.toString()) {
        return res.status(422).send({ message: err.PARAMS_INVALID })
      }

      const key = Object.keys(req.body).reduce((prev, next) =>
        next !== 'csrfToken' ? next : prev
      )

      let update: Record<string, unknown>

      switch (key) {
        case 'name':
          validateSchema(nameCsrfSchema, req.body, res)
          update = { name: req.body.name }
          break
        case 'description': {
          validateSchema(descriptionCsrfSchema, req.body, res)
          update = { description: req.body.description }
          break
        }
        case 'categories': {
          validateSchema(reqCategoriesCsrfSchema, req.body, res)
          update = { categories: req.body.categories }
          break
        }
        case 'price':
          validateSchema(reqPriceCsrfSchema, req.body, res)
          update = { price: req.body.price * 100 }
          break
        case 'images':
          validateSchema(imagesArrayCsrfSchema, req.body, res, true)

          const images: string[] = []

          for (const { base64, type } of req.body.images as Image[]) {
            if (isBase64ValueTooLarge(base64, 1000000)) {
              return res.status(413).send({ message: err.IMAGE_TOO_LARGE })
            }

            const filename = nanoid() + '.' + type
            const uri = '/static/images/posts/' + filename
            const path = cwd() + '/public' + uri

            const imageData = Buffer.from(base64, 'base64')
            await appendFile(path, imageData)

            images.push(uri)
          }

          const post = await Post.findOne({ _id: id }).lean().exec()

          if (!post) {
            return res.status(404).send({ message: err.POST_NOT_FOUND })
          }

          for (const image of post.images) {
            await unlink(cwd() + '/public' + image)
          }

          update = { images }
          break
        default:
          return res.status(422).send({ message: err.DATA_INVALID })
      }

      try {
        await dbConnect()
        await Post.updateOne({ _id: id }, update).exec()
      } catch (e) {
        res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
      }

      res.status(200).end()
      break
    }
    case 'DELETE': {
      const resp = await authCheck(req)
      if (resp) return res.status(resp.status).send({ message: resp.message })

      const session = (await getSession({ req })) as Session

      const post = await Post.findOne({ _id: id }).lean().exec()

      if (!post) {
        return res.status(404).send({ message: err.POST_NOT_FOUND })
      }

      if (session.id !== post.userId.toString()) {
        return res.status(422).send({ message: err.PARAMS_INVALID })
      }

      for (const image of post.images) {
        await unlink(cwd() + '/public' + image)
      }

      try {
        await dbConnect()
        await Post.deleteOne({ _id: id }).exec()
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
      sizeLimit: '7mb',
    },
  },
}
