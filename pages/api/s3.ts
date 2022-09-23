import { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const result = validate<string>(csrfTokenSchema, req.body?.csrfToken)
  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const csrfTokenCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME]

  if (!isCsrfTokenValid(csrfTokenCookie, result.value)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const input = { Bucket: env.AWS_BUCKET_NAME, Key: nanoid() }

  const command = new PutObjectCommand(input)

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 30 })

  res.status(200).json({ url: signedUrl, key: input.Key })
}

export default catchError(handler)
