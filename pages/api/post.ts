import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import Post from '../../models/Post'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import dbConnect from '../../utils/functions/dbConnect'
import err from '../../utils/constants/errors'
import isBase64ValueTooBig from '../../utils/functions/isBase64ValueTooBig'
import validate from '../../utils/functions/validate'
import createFile from '../../utils/functions/createFile'
import {
  CreatePostServerSchema,
  createPostServerSchema,
} from '../../lib/joi/createPostSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const result = validate(
    createPostServerSchema,
    req.body as CreatePostServerSchema
  )

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const csrfTokenCookie = req.cookies['next-auth.csrf-token']
  const csrfToken = result.value.csrfToken

  if (!isCsrfTokenValid(csrfTokenCookie, csrfToken)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const { price, images, ...rest } = result.value

  try {
    await dbConnect()

    const imagesUri: string[] = []

    for (const { base64, ext } of images) {
      if (isBase64ValueTooBig(base64, 1000000)) {
        const json = { name: 'images', message: err.IMAGE_TOO_BIG }
        return res.status(413).json(json)
      }

      const path = '/public/static/images/posts/'
      const fname = await createFile(base64, ext, path, { enc: 'base64' })

      imagesUri.push(fname)
    }

    const post = new Post({
      ...rest,
      price: price * 100,
      images: imagesUri,
      userId: session.id,
    })

    await post.save()
  } catch (e) {
    res.status(500).json({ message: err.DEFAULT })
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
