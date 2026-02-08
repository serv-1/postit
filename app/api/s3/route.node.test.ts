import { NextRequest } from 'next/server'
import { GET } from './route'
import { auth } from 'libs/auth'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import {
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'
import type { Session } from 'next-auth'

vi.mock('libs/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('functions/verifyCsrfTokens', () => ({
  default: vi.fn(),
}))

vi.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: vi.fn(),
}))

vi.mock('nanoid', () => ({
  nanoid: () => 'id',
}))

const mockAuth = vi.mocked<() => Promise<Session | null>>(auth)
const mockVerifyCsrfTokens = vi.mocked(verifyCsrfTokens)
const mockCreatePresignedPost = vi.mocked(createPresignedPost)

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
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - create presigned post failed', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockCreatePresignedPost.mockRejectedValue({})

    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('200 - get the needed data to add something to s3 bucket', async () => {
    const s3Data = { url: 'url', fields: { test: 'true' } }

    mockAuth.mockResolvedValue({} as Session)
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
