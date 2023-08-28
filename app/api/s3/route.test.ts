/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from './route'
import err from 'utils/constants/errors'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'utils/functions/verifyCsrfTokens'
// @ts-expect-error
import { mockCreatePresignedPost } from '@aws-sdk/s3-presigned-post'

jest
  .mock('next-auth')
  .mock('utils/functions/verifyCsrfTokens')
  .mock('@aws-sdk/s3-presigned-post')

describe('GET', () => {
  test('401 - unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  test('500 - create presigned post failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockCreatePresignedPost.mockRejectedValue({})

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('200 - get the needed data to add something to s3 bucket', async () => {
    const s3Data = { url: 'url', fields: { test: true } }

    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockCreatePresignedPost.mockResolvedValue(s3Data)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      url: s3Data.url,
      fields: s3Data.fields,
      key: '_nanoid_mock',
    })
  })
})
