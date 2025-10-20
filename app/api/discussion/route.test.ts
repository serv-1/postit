/**
 * @jest-environment node
 */

import { POST } from './route'
import { NextRequest } from 'next/server'
import mongoose from 'mongoose'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { mockAuth } from 'libs/auth'
// @ts-expect-error
import { mockPusherTrigger } from 'libs/pusher/server'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from 'models/User'
import Discussion from 'models/Discussion'
import {
  CSRF_TOKEN_INVALID,
  DATA_INVALID,
  DISCUSSION_ALREADY_EXISTS,
  ID_INVALID,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from 'constants/errors'
import Post from 'models/Post'

jest
  .mock('libs/auth')
  .mock('functions/dbConnect')
  .mock('libs/pusher/server')
  .mock('functions/verifyCsrfTokens')

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
  test('401 - unauthorized', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid json', async () => {
    mockAuth.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockAuth.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message')
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: new mongoose.Types.ObjectId().toString(),
        sellerId: new mongoose.Types.ObjectId().toString(),
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test("422 - the authenticated user can't be the seller", async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: new mongoose.Types.ObjectId().toString(),
        sellerId: session.id,
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: ID_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: new mongoose.Types.ObjectId().toString(),
        sellerId: new mongoose.Types.ObjectId().toString(),
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('409 - discussion already exists', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }
    const postId = new mongoose.Types.ObjectId().toString()
    const sellerId = new mongoose.Types.ObjectId().toString()

    await new Discussion({
      messages: [],
      buyerId: session.id,
      sellerId,
      postName: 'table',
      postId,
    }).save()

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId,
        sellerId,
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: DISCUSSION_ALREADY_EXISTS })

    await Discussion.deleteMany()
  })

  test('404 - seller not found', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: new mongoose.Types.ObjectId().toString(),
        sellerId: new mongoose.Types.ObjectId().toString(),
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: USER_NOT_FOUND })
  })

  test('500 - "discussion:new" pusher event triggering failed', async () => {
    const seller = await new User({
      name: 'jane',
      email: 'jane@test.com',
      password: 'password',
      postIds: [],
      favPostIds: [],
      discussions: [],
    }).save()

    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockPusherTrigger.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: new mongoose.Types.ObjectId().toString(),
        sellerId: seller._id.toString(),
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })

    await User.deleteMany()
  })

  test('201 - discussion created', async () => {
    const seller = await new User({
      name: 'jane',
      email: 'jane@test.com',
      password: 'password',
      postIds: [],
      favPostIds: [],
      discussions: [],
    }).save()

    const post = await new Post({
      name: 'table',
      description: 'magnificent table',
      categories: ['furniture'],
      price: 4000,
      images: ['table.jpg'],
      userId: seller._id,
      address: 'France',
      latLon: [42, 58],
      discussionIds: [],
    }).save()

    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockPusherTrigger.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: post._id.toString(),
        sellerId: seller._id.toString(),
        postName: 'table',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    const discussion = (await Discussion.findOne({
      buyerId: session.id,
      postId: post._id,
    })
      .lean()
      .exec())!

    expect(mockPusherTrigger).toHaveBeenNthCalledWith(
      1,
      seller.channelName,
      'discussion:new',
      { ...discussion, hasNewMessage: true }
    )

    expect(response).toHaveProperty('status', 201)
    expect(data).toEqual({ _id: discussion._id.toString() })
  })
})
