/**
 * @jest-environment node
 */

import { POST } from './route'
import { NextRequest } from 'next/server'
import err from 'utils/constants/errors'
import { Types } from 'mongoose'
// @ts-expect-error
import { PostDoc, mockSavePost } from 'models/Post'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'utils/functions/verifyCsrfTokens'

jest
  .mock('models/Post')
  .mock('utils/functions/dbConnect')
  .mock('next-auth')
  .mock('utils/functions/verifyCsrfTokens')

describe('POST', () => {
  it('401 - Unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  it('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  it('422 - invalid request body', async () => {
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

  it('422 - invalid csrf token', async () => {
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
        csrfToken: 'token',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  it('500 - database connection failed', async () => {
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
        csrfToken: 'token',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - post creation failed', async () => {
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
        csrfToken: 'token',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('201 - post creation succeeded', async () => {
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
        csrfToken: 'token',
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
    expect(data).toEqual({ id: post._id.toString() })
  })
})
