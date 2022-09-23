import { NextApiRequest, NextApiResponse } from 'next'
import Post from '../../models/Post'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import dbConnect from '../../utils/functions/dbConnect'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'
import formatToUrl from '../../utils/functions/formatToUrl'
import addPostApiSchema from '../../schemas/addPostApiSchema'
import getSessionAndUser from '../../utils/functions/getSessionAndUser'
import catchError from '../../utils/functions/catchError'
import env from '../../utils/constants/env'

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

  const csrfTokenCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME] || ''
  const csrfToken = result.value.csrfToken

  if (!isCsrfTokenValid(csrfTokenCookie, csrfToken)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const { price, ...rest } = result.value

  await dbConnect()

  const post = new Post({
    ...rest,
    price: price * 100,
    userId: session.id,
  })

  await post.save()

  res.setHeader('Location', `/posts/${post.id}/${formatToUrl(post.name)}`)
  res.status(201).json({ id: post._id.toString() })
}

export default catchError(handler)
