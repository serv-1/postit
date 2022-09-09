import { NextApiRequest, NextApiResponse } from 'next'
import Post from '../../models/Post'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import dbConnect from '../../utils/functions/dbConnect'
import err from '../../utils/constants/errors'
import isBase64ValueTooBig from '../../utils/functions/isBase64ValueTooBig'
import validate from '../../utils/functions/validate'
import createFile from '../../utils/functions/createFile'
import formatToUrl from '../../utils/functions/formatToUrl'
import addPostApiSchema from '../../schemas/addPostApiSchema'
import getSessionAndUser from '../../utils/functions/getSessionAndUser'
import catchError from '../../utils/functions/catchError'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const result = validate(addPostApiSchema, req.body)

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const csrfTokenCookie = req.cookies['next-auth.csrf-token'] || ''
  const csrfToken = result.value.csrfToken

  if (!isCsrfTokenValid(csrfTokenCookie, csrfToken)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const { price, images, ...rest } = result.value

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

  res.setHeader('Location', `/posts/${post.id}/${formatToUrl(post.name)}`)
  res.status(201).json({ id: post._id.toString() })
}

export default catchError(handler)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb',
    },
  },
}
