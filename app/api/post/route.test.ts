/**
 * @jest-environment node
 */

import { POST } from './route'
import { NextRequest } from 'next/server'
import mongoose from 'mongoose'
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
import { MongoMemoryServer } from 'mongodb-memory-server'
import Post from 'models/Post'

jest
  .mock('libs/pusher/server')
  .mock('functions/dbConnect')
  .mock('next-auth')
  .mock('functions/verifyCsrfTokens')
  .mock('libs/nextAuth', () => ({
    nextAuthOptions: {},
  }))

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

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

  test('201 - post creation succeeded', async () => {
    const reqData = {
      name: 'tâblë',
      description: 'Magnificent table',
      price: 40,
      categories: ['furniture'],
      images: ['image'],
      address: 'Oslo, Norway',
      latLon: [42, 58],
    }

    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify(reqData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toEqual({ _id: expect.any(String) })

    const post = (await Post.findById(data._id).lean().exec())!

    expect(response).toHaveProperty('status', 201)
    expect(response.headers.get('Location')).toBe(
      `/posts/${post._id.toString()}/table`
    )
  })
})
