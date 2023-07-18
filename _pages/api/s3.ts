import { NextApiRequest, NextApiResponse } from 'next'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import s3Client from '../../libs/s3Client'
import catchError from '../../utils/functions/catchError'
import env from '../../utils/constants/env'
import { nanoid } from 'nanoid'
import err from '../../utils/constants/errors'
import getSessionAndUser from '../../utils/functions/getSessionAndUser'
import validate from '../../utils/functions/validate'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import csrfTokenSchema from '../../schemas/csrfTokenSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const result = validate<string>(csrfTokenSchema, req.query?.csrfToken)
  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const csrfTokenCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME] || ''
  if (!isCsrfTokenValid(csrfTokenCookie, result.value)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const Key = nanoid()

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: env.AWS_BUCKET_NAME,
    Key,
    Conditions: [['content-length-range', 0, 1048576]],
    Expires: 60,
  })

  res.status(200).json({ url, fields, key: Key })
}

export default catchError(handler)
