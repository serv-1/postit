import { NextApiRequest, NextApiResponse } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import Post from '../../models/Post'
import authCheck from '../../utils/functions/authCheck'
import dbConnect from '../../utils/functions/dbConnect'
import err from '../../utils/constants/errors'
import isBase64ValueTooLarge from '../../utils/functions/isBase64ValueTooLarge'
import { createPostServerSchema } from '../../lib/joi/createPostSchema'
import { appendFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import validateSchema from '../../utils/functions/validateSchema'
import { cwd } from 'process'
import { Image } from '../../types/common'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const resp = await authCheck(req)
  if (resp) return res.status(resp.status).send({ message: resp.message })

  if (req.method !== 'POST') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  validateSchema(createPostServerSchema, req.body, res, true)

  const decimals = req.body.price.toString().split(/\.|,/)[1]
  if (decimals && decimals.length > 2) {
    return res.status(422).send({ name: 'price', message: err.PRICE_INVALID })
  }

  try {
    const session = (await getSession({ req })) as Session
    await dbConnect()

    const images: string[] = []

    for (const { base64, type } of req.body.images as Image[]) {
      if (isBase64ValueTooLarge(base64, 1000000)) {
        const json = { name: 'images', message: err.IMAGE_TOO_LARGE }
        return res.status(413).send(json)
      }

      const filename = nanoid() + '.' + type
      const uri = '/static/images/posts/' + filename
      const path = cwd() + '/public/' + uri

      await appendFile(path, Buffer.from(base64, 'base64'))

      images.push(uri)
    }

    const post = new Post({
      ...req.body,
      price: req.body.price * 100,
      images,
      userId: session.id,
    })
    await post.save()
  } catch (e) {
    res.status(500).send({ message: err.DEFAULT_SERVER_ERROR })
  }

  res.status(200).end()
}

export default handler

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb',
    },
  },
}
