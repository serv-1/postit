import { GET, PUT, DELETE } from './route'
import mongoose, { type Connection } from 'mongoose'
import { NextRequest } from 'next/server'
import { auth } from 'libs/auth'
import dbConnect from 'functions/dbConnect'
import deleteImage from 'functions/deleteImage'
import verifyCsrfTokens from 'functions/verifyCsrfTokens'
import {
  PARAMS_INVALID,
  INTERNAL_SERVER_ERROR,
  POST_NOT_FOUND,
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
  DATA_INVALID,
  FORBIDDEN,
} from 'constants/errors'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Post, { type PostDoc } from 'models/Post'
import type { Session } from 'next-auth'

vi.mock('libs/pusher/server', () => ({
  default: {},
}))

vi.mock('libs/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('functions/dbConnect', () => ({
  default: vi.fn(),
}))

vi.mock('functions/deleteImage', () => ({
  default: vi.fn(),
}))

vi.mock('functions/verifyCsrfTokens', () => ({
  default: vi.fn(),
}))

const mockDbConnect = vi.mocked(dbConnect)
const mockAuth = vi.mocked<() => Promise<Session | null>>(auth)
const mockDeleteImage = vi.mocked(deleteImage)
const mockVerifyCsrfTokens = vi.mocked(verifyCsrfTokens)

let mongoServer: MongoMemoryServer
let post: PostDoc

async function populateDb() {
  post = await new Post({
    name: 'table',
    description: 'Magnificent table',
    price: 4000,
    categories: ['furniture'],
    images: ['table1', 'table2'],
    address: 'Tokyo, Japan',
    latLon: [44, 33],
    userId: new mongoose.Types.ObjectId(),
    discussionIds: [],
  }).save()
}

async function resetDb() {
  await Post.deleteMany({})
  await populateDb()
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())
  await populateDb()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('GET', () => {
  test('422 - invalid id', async () => {
    const response = await GET(new Request('http://-'), {
      params: Promise.resolve({ id: 'invalid id' }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const response = await GET(new Request('http://-'), {
      params: Promise.resolve({ id: post._id.toString() }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - post not found', async () => {
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await GET(new Request('http://-'), {
      params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: POST_NOT_FOUND })
  })

  test('200 - get the post', async () => {
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await GET(new Request('http://-'), {
      params: Promise.resolve({ id: post._id.toString() }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      ...JSON.parse(JSON.stringify(post)),
      price: post.price / 100,
    })
  })
})

describe('PUT', () => {
  test('422 - invalid id', async () => {
    const response = await PUT(new NextRequest('http://-', { method: 'PUT' }), {
      params: Promise.resolve({ id: 'invalid id' }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('401 - unauthorized', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await PUT(new NextRequest('http://-', { method: 'PUT' }), {
      params: Promise.resolve({ id: post._id.toString() }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(false)

    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ name: 'blue table' }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('422 - invalid json', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)

    const response = await PUT(new NextRequest('http://-', { method: 'PUT' }), {
      params: Promise.resolve({ id: post._id.toString() }),
    })
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)

    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ name: 1 }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ name: 'blue table' }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - post not found', async () => {
    await Post.deleteOne({ _id: post._id }).lean().exec()

    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ name: 'blue table' }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: POST_NOT_FOUND })

    await resetDb()
  })

  test('403 - forbidden', async () => {
    mockAuth.mockResolvedValue({
      id: new mongoose.Types.ObjectId().toString(),
    } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ name: 'blue table' }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('500 - deleting old images failed', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockRejectedValue({})

    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ images: ['newImage1', 'newImage2'] }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('204 - images updated', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockResolvedValue()

    const newImages = ['newImage1', 'newImage2']
    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ images: newImages }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )

    expect(mockDeleteImage).toHaveBeenNthCalledWith(1, post.images[0])
    expect(mockDeleteImage).toHaveBeenNthCalledWith(2, post.images[1])

    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('images', newImages)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - price updated', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockResolvedValue()

    const newPrice = 80
    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ price: newPrice }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('price', newPrice * 100)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - name updated', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockResolvedValue()

    const newName = 'blue table'
    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('name', newName)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - description updated', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockResolvedValue()

    const newDescription = 'awesome table'
    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ description: newDescription }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('description', newDescription)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - categories updated', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockResolvedValue()

    const newCategories = ['decoration', 'Do-It-Yourself']
    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ categories: newCategories }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('categories', newCategories)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - address updated', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)
    mockDeleteImage.mockResolvedValue()

    const newAddress = 'Oslo, Norway'
    const newLatLon = [11, 22]
    const response = await PUT(
      new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ address: newAddress, latLon: newLatLon }),
      }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('address', newAddress)
    expect(updatedPost).toHaveProperty('latLon', newLatLon)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })
})

describe('DELETE', () => {
  test('422 - invalid id', async () => {
    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'invalid id' }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('401 - unauthorized', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(false)

    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - post not found', async () => {
    mockAuth.mockResolvedValue({} as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      {
        params: Promise.resolve({
          id: new mongoose.Types.ObjectId().toString(),
        }),
      },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: POST_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    mockAuth.mockResolvedValue({
      id: new mongoose.Types.ObjectId().toString(),
    } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('204 - post deleted', async () => {
    mockAuth.mockResolvedValue({ id: post.userId.toString() } as Session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({} as Connection)

    const response = await DELETE(
      new NextRequest('http://-', { method: 'DELETE' }),
      { params: Promise.resolve({ id: post._id.toString() }) },
    )
    const deletedPost = await Post.findById(post._id).lean().exec()

    expect(deletedPost).toBeNull()
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })
})
