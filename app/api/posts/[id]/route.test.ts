/**
 * @jest-environment node
 */

import { GET, PUT, DELETE } from './route'
import mongoose from 'mongoose'
import { NextRequest } from 'next/server'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { mockDeleteImage } from 'functions/deleteImage'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'
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

jest
  .mock('libs/pusher/server')
  .mock('next-auth')
  .mock('functions/dbConnect')
  .mock('functions/deleteImage')
  .mock('functions/verifyCsrfTokens')
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))

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
    const request = new Request('http://-')
    const params = { params: { id: 'invalid id' } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: post._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - post not found', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: POST_NOT_FOUND })
  })

  test('200 - get the post', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-')
    const params = { params: { id: post._id.toString() } }
    const response = await GET(request, params)
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
    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: 'invalid id' } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('401 - unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: 'blue table' }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: 1 }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: 'blue table' }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - post not found', async () => {
    await Post.deleteOne({ _id: post._id }).lean().exec()

    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: 'blue table' }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: POST_NOT_FOUND })

    await resetDb()
  })

  test('403 - forbidden', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: 'blue table' }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('500 - deleting old images failed', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ images: ['newImage1', 'newImage2'] }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('204 - images updated', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const newImages = ['newImage1', 'newImage2']
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ images: newImages }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)

    expect(mockDeleteImage).toHaveBeenNthCalledWith(1, post.images[0])
    expect(mockDeleteImage).toHaveBeenNthCalledWith(2, post.images[1])

    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('images', newImages)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - price updated', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const newPrice = 80
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ price: newPrice }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('price', newPrice * 100)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - name updated', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const newName = 'blue table'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('name', newName)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - description updated', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const newDescription = 'awesome table'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ description: newDescription }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('description', newDescription)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - categories updated', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const newCategories = ['decoration', 'Do-It-Yourself']
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ categories: newCategories }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
    const updatedPost = await Post.findById(post._id).lean().exec()!

    expect(updatedPost).toHaveProperty('categories', newCategories)
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })

  test('204 - address updated', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const newAddress = 'Oslo, Norway'
    const newLatLon = [11, 22]
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ address: newAddress, latLon: newLatLon }),
    })

    const params = { params: { id: post._id.toString() } }
    const response = await PUT(request, params)
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
    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: 'invalid id' } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('401 - unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: post._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: post._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: post._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - post not found', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: POST_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: post._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('204 - post deleted', async () => {
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: post._id.toString() } }
    const response = await DELETE(request, params)
    const deletedPost = await Post.findById(post._id).lean().exec()

    expect(deletedPost).toBeNull()
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    await resetDb()
  })
})
