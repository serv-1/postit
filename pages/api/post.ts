import { NextApiRequest, NextApiResponse } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import Post from '../../models/Post'
import authCheck from '../../utils/functions/authCheck'
import dbConnect from '../../utils/functions/dbConnect'
import err from '../../utils/constants/errors'
import isBase64ValueTooLarge from '../../utils/functions/isBase64ValueTooLarge'
import { createPostServerSchema } from '../../lib/joi/createPostSchema'
import { Buffer } from 'buffer'
import validateSchema from '../../utils/functions/validateSchema'

interface Image {
  base64Uri: string
  type: 'image/jpeg' | 'image/png' | 'image/gif'
}

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

  for (const image of req.body.images) {
    if (!image.base64Uri.includes(',')) {
      return res
        .status(422)
        .send({ name: 'images', message: err.IMAGES_INVALID })
    }

    if (isBase64ValueTooLarge(image.base64Uri, 1000000)) {
      return res
        .status(413)
        .send({ name: 'images', message: err.IMAGE_TOO_LARGE })
    }
  }

  try {
    const session = (await getSession({ req })) as Session
    await dbConnect()

    const images = (req.body.images as Image[]).map((image) => ({
      data: Buffer.from(image.base64Uri.split(',')[1], 'base64'),
      contentType: image.type,
    }))

    const post = new Post({
      ...req.body,
      price: req.body.price * 100,
      images,
      userId: session.user.id,
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
