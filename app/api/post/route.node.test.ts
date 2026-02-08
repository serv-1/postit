import { POST } from './route'
import { NextRequest } from 'next/server'
import mongoose, { type Connection } from 'mongoose'
import dbConnect from 'functions/dbConnect'
import { auth } from 'libs/auth'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import {
  UNAUTHORIZED,
  DATA_INVALID,
  CSRF_TOKEN_INVALID,
  INTERNAL_SERVER_ERROR,
} from 'constants/errors'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Post from 'models/Post'
import type { Session } from 'next-auth'

vi.mock('libs/pusher/server', () => ({
  default: {},
}))

vi.mock('functions/dbConnect', () => ({
  default: vi.fn(),
}))

vi.mock('libs/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('functions/verifyCsrfTokens', () => ({
  default: vi.fn(),
}))

const mockDbConnect = vi.mocked(dbConnect)
const mockAuth = vi.mocked<() => Promise<Session | null>>(auth)
const mockVerifyCsrfTokens = vi.mocked(verifyCsrfTokens)
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
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid json', async () => {
    mockAuth.mockResolvedValue({} as Session)

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockAuth.mockResolvedValue({} as Session)

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
    mockAuth.mockResolvedValue({} as Session)
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
    mockAuth.mockResolvedValue({} as Session)
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

    mockAuth.mockResolvedValue({
      id: new mongoose.Types.ObjectId().toString(),
    } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)

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
      `/posts/${post._id.toString()}/table`,
    )
  })
})
