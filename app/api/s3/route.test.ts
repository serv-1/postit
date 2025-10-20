/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from './route'
// @ts-expect-error
import { mockAuth } from 'libs/auth'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'
// @ts-expect-error
import { mockCreatePresignedPost } from '@aws-sdk/s3-presigned-post'
import {
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

jest
  .mock('libs/auth')
  .mock('functions/verifyCsrfTokens')
  .mock('@aws-sdk/s3-presigned-post')
  .mock('nanoid', () => ({
    nanoid: () => 'id',
  }))

describe('GET', () => {
  test('401 - unauthorized', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - create presigned post failed', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockCreatePresignedPost.mockRejectedValue({})

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('200 - get the needed data to add something to s3 bucket', async () => {
    const s3Data = { url: 'url', fields: { test: true } }

    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockCreatePresignedPost.mockResolvedValue(s3Data)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      url: s3Data.url,
      fields: s3Data.fields,
      key: 'id',
    })
  })
})
