/**
 * @jest-environment node
 */

import { POST } from './route'
import { NextRequest } from 'next/server'
import { Types } from 'mongoose'
// @ts-expect-error
import { type PostDoc, mockSavePost } from 'models/Post'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'
import {
  UNAUTHORIZED,
  DATA_INVALID,
  CSRF_TOKEN_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'

jest
  .mock('models/Post')
  .mock('functions/dbConnect')
  .mock('next-auth')
  .mock('functions/verifyCsrfTokens')
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))

describe('POST', () => {
  test('401 - Unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('message')
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'table',
        description: 'Magnificent table',
        price: 40,
        categories: ['furniture'],
        images: ['image'],
        address: 'Oslo, Norway',
        latLon: [42, 58],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'table',
        description: 'Magnificent table',
        price: 40,
        categories: ['furniture'],
        images: ['image'],
        address: 'Oslo, Norway',
        latLon: [42, 58],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - post creation failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockSavePost.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'table',
        description: 'Magnificent table',
        price: 40,
        categories: ['furniture'],
        images: ['image'],
        address: 'Oslo, Norway',
        latLon: [42, 58],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('201 - post creation succeeded', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'tâblë',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Oslo, Norway',
      latLon: [42, 58],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }

    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockSavePost.mockResolvedValue(post)

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: post.name,
        description: post.description,
        price: post.price / 100,
        categories: post.categories,
        images: post.images,
        address: post.address,
        latLon: post.latLon,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(mockSavePost).toHaveBeenNthCalledWith(1, {
      name: post.name,
      description: post.description,
      categories: post.categories,
      images: post.images,
      address: post.address,
      latLon: post.latLon,
      price: post.price,
      userId: session.id,
    })

    expect(response).toHaveProperty('status', 201)
    expect(response.headers.get('Location')).toBe(
      `/posts/${post._id.toString()}/table`
    )

    expect(data).toEqual({ _id: post._id.toString() })
  })
})
