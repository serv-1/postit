import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { nextAuthOptions } from '../auth/[...nextauth]/route'
import err from 'utils/constants/errors'
import verifyCsrfTokens from 'utils/functions/verifyCsrfTokens'
import { nanoid } from 'nanoid'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import s3Client from 'libs/s3Client'
import env from 'utils/constants/env'

export async function GET(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: err.UNAUTHORIZED }, { status: 401 })
  }

  const csrfToken = request.nextUrl.searchParams.get('csrfToken')

  if (!csrfToken || !verifyCsrfTokens(request.cookies, csrfToken)) {
    return NextResponse.json(
      { message: err.CSRF_TOKEN_INVALID },
      { status: 422 }
    )
  }

  const key = nanoid()

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Conditions: [['content-length-range', 0, 1048576]],
      Expires: 60,
    })

    return NextResponse.json({ url, fields, key }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { message: err.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}