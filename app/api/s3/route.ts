import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import { nanoid } from 'nanoid'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import s3Client from 'libs/s3Client'
import { AWS_BUCKET_NAME } from 'env'
import {
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

export async function GET(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return NextResponse.json({ message: UNAUTHORIZED }, { status: 401 })
  }

  if (!verifyCsrfTokens(request)) {
    return NextResponse.json({ message: CSRF_TOKEN_INVALID }, { status: 422 })
  }

  const key = nanoid()

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Conditions: [['content-length-range', 0, 1048576]],
      Expires: 60,
    })

    return NextResponse.json({ url, fields, key }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
