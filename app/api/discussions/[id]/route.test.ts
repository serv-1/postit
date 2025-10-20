/**
 * @jest-environment node
 */

import Discussion, { type DiscussionDoc } from 'models/Discussion'
import User, { type UserDoc } from 'models/User'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { NextRequest } from 'next/server'
import { DELETE, GET, PUT } from './route'
import {
  CANNOT_SEND_MSG,
  CSRF_TOKEN_INVALID,
  DATA_INVALID,
  DISCUSSION_NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  PARAMS_INVALID,
  UNAUTHORIZED,
} from 'constants/errors'
// @ts-expect-error
import { mockAuth } from 'libs/auth'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { mockPusherTrigger } from 'libs/pusher/server'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'

jest
  .mock('libs/auth')
  .mock('functions/dbConnect')
  .mock('libs/pusher/server')
  .mock('functions/verifyCsrfTokens')

let mongoServer: MongoMemoryServer
let buyer: UserDoc
let seller: UserDoc
let discussion: DiscussionDoc

async function resetEntities() {
  await User.updateOne(
    { _id: buyer._id },
    {
      $set: {
        image: 'buyer.jpg',
        discussions: [{ id: discussion._id }],
      },
    }
  )
    .lean()
    .exec()

  await User.updateOne(
    { _id: seller._id },
    {
      $set: {
        image: 'seller.jpg',
        discussions: [{ id: discussion._id }],
      },
    }
  )
    .lean()
    .exec()

  await Discussion.updateOne(
    { _id: discussion._id },
    {
      $set: {
        buyerId: buyer._id,
        sellerId: seller._id,
        messages: [{ message: 'yo', userId: buyer._id }],
      },
    }
  )
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())

  buyer = await new User({
    name: 'buyer',
    image: 'buyer.jpg',
    email: 'a@a.com',
    password: 'password',
  }).save()

  seller = await new User({
    name: 'seller',
    image: 'seller.jpg',
    email: 'b@a.com',
    password: 'password',
  }).save()

  discussion = await new Discussion({
    buyerId: buyer._id,
    sellerId: seller._id,
    postId: new mongoose.Types.ObjectId(),
    postName: 'postName',
    messages: [{ message: 'yo', userId: buyer._id }],
  }).save()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('GET', () => {
  test('422 - invalid id', async () => {
    const request = new NextRequest('http://-')
    const params = { params: { id: 'invalid id' } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('401 - unauthorized', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test("422 - invalid search params' csrf token", async () => {
    mockAuth.mockResolvedValue({})

    const request = new NextRequest('http://-')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-?csrfToken=token')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue()

    const request = new NextRequest('http://-')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - discussion not found', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: DISCUSSION_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-')
    const params = { params: { id: discussion._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('200 - get the discussion', async () => {
    await User.updateOne(
      { _id: buyer._id, 'discussions.id': discussion._id },
      { $set: { 'discussions.$.hasNewMessage': true } }
    )
      .lean()
      .exec()

    const session = { id: buyer._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-')
    const params = { params: { id: discussion._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    await resetEntities()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      ...JSON.parse(JSON.stringify(discussion)),
      hasNewMessage: true,
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
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({})
    mockDbConnect.mockRejectedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - discussion not found', async () => {
    mockAuth.mockResolvedValue({})
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: DISCUSSION_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test("409 - can't send a message if the buyer is null", async () => {
    await Discussion.updateOne({ _id: discussion._id }, { buyerId: null })
      .lean()
      .exec()

    const session = { id: seller._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    await resetEntities()

    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: CANNOT_SEND_MSG })
  })

  test("409 - can't send a message if the seller is null", async () => {
    await Discussion.updateOne({ _id: discussion._id }, { sellerId: null })
      .lean()
      .exec()

    const session = { id: buyer._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    await resetEntities()

    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: CANNOT_SEND_MSG })
  })

  test('422 - invalid csrf token', async () => {
    const session = { id: buyer._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue()
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  describe('add a new message', () => {
    test('422 - invalid json', async () => {
      const session = { id: buyer._id.toString() }

      mockAuth.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue()
      mockVerifyCsrfTokens.mockReturnValue(true)

      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: '',
        headers: { 'Content-Length': '1' },
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(response).toHaveProperty('status', 422)
      expect(data).toEqual({ message: DATA_INVALID })
    })

    test('422 - invalid request body', async () => {
      const session = { id: buyer._id.toString() }

      mockAuth.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue()
      mockVerifyCsrfTokens.mockReturnValue(true)

      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: { 'Content-Length': '1' },
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(response).toHaveProperty('status', 422)
      expect(data).toHaveProperty('message')
    })

    test('500 - sending the new message to the discussion failed', async () => {
      const session = { id: buyer._id.toString() }

      mockAuth.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue()
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockPusherTrigger.mockRejectedValue()

      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message: 'hi' }),
        headers: { 'Content-Length': '1' },
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      const updatedDiscussion = (await Discussion.findById(discussion._id)
        .lean()
        .exec())!

      await resetEntities()

      expect(mockPusherTrigger).toHaveBeenNthCalledWith(
        1,
        discussion.channelName,
        'message:new',
        updatedDiscussion.messages.at(-1)
      )

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    describe('as the buyer', () => {
      test('500 - sending the discussion to the seller if it has hidden it failed', async () => {
        await User.updateOne(
          { _id: seller._id, 'discussions.id': discussion._id },
          { $set: { 'discussions.$.hidden': true } }
        )
          .lean()
          .exec()

        const session = { id: buyer._id.toString() }

        mockAuth.mockResolvedValue(session)
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)
        mockPusherTrigger.mockRejectedValue().mockResolvedValueOnce()

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'hi' }),
          headers: { 'Content-Length': '1' },
        })

        const params = { params: { id: discussion._id.toString() } }
        const response = await PUT(request, params)
        const data = await response.json()

        const updatedDiscussion = (await Discussion.findById(discussion._id)
          .lean()
          .exec())!

        await resetEntities()

        expect(mockPusherTrigger).toHaveBeenNthCalledWith(
          2,
          seller.channelName,
          'discussion:new',
          {
            ...updatedDiscussion,
            hasNewMessage: true,
          }
        )

        expect(response).toHaveProperty('status', 500)
        expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
      })

      it('unhides the discussion if it was hidden', async () => {
        await User.updateOne(
          { _id: buyer._id, 'discussions.id': discussion._id },
          { $set: { 'discussions.$.hidden': true } }
        )
          .lean()
          .exec()

        mockAuth.mockResolvedValue({ id: buyer._id.toString() })
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'yo' }),
          headers: { 'Content-Length': '1' },
        })

        await PUT(request, { params: { id: discussion._id.toString() } })

        const { discussions } = (await User.findById(buyer._id).lean().exec())!

        await resetEntities()

        expect(discussions[0].hidden).toBe(false)
      })

      it("updates the seller's discussion", async () => {
        await User.updateOne(
          { _id: seller._id, 'discussions.id': discussion._id },
          { $set: { 'discussions.$.hidden': true } }
        )
          .lean()
          .exec()

        mockAuth.mockResolvedValue({ id: buyer._id.toString() })
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'yo' }),
          headers: { 'Content-Length': '1' },
        })

        await PUT(request, { params: { id: discussion._id.toString() } })

        const { discussions } = (await User.findById(seller._id).lean().exec())!

        await resetEntities()

        expect(discussions[0].hidden).toBe(false)
        expect(discussions[0].hasNewMessage).toBe(true)
      })

      test('500 - notifying the seller about the new message failed', async () => {
        const session = { id: buyer._id.toString() }

        mockAuth.mockResolvedValue(session)
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)
        mockPusherTrigger.mockRejectedValue().mockResolvedValueOnce()

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'yo' }),
          headers: { 'Content-Length': '1' },
        })

        const params = { params: { id: discussion._id.toString() } }
        const response = await PUT(request, params)
        const data = await response.json()

        await resetEntities()

        expect(mockPusherTrigger).toHaveBeenNthCalledWith(
          2,
          seller.channelName,
          'message:new',
          ''
        )

        expect(response).toHaveProperty('status', 500)
        expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
      })
    })

    describe('as the seller', () => {
      test('500 - sending the discussion to the buyer if it has hidden it failed', async () => {
        await User.updateOne(
          { _id: buyer._id, 'discussions.id': discussion._id },
          { $set: { 'discussions.$.hidden': true } }
        )
          .lean()
          .exec()

        const session = { id: seller._id.toString() }

        mockAuth.mockResolvedValue(session)
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)
        mockPusherTrigger.mockRejectedValue().mockResolvedValueOnce()

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'hi' }),
          headers: { 'Content-Length': '1' },
        })

        const params = { params: { id: discussion._id.toString() } }
        const response = await PUT(request, params)
        const data = await response.json()

        const updatedDiscussion = (await Discussion.findById(discussion._id)
          .lean()
          .exec())!

        await resetEntities()

        expect(mockPusherTrigger).toHaveBeenNthCalledWith(
          2,
          buyer.channelName,
          'discussion:new',
          { ...updatedDiscussion, hasNewMessage: true }
        )

        expect(response).toHaveProperty('status', 500)
        expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
      })

      it('unhides the discussion if it was hidden', async () => {
        await User.updateOne(
          { _id: seller._id, 'discussions.id': discussion._id },
          { $set: { 'discussions.$.hidden': true } }
        )
          .lean()
          .exec()

        mockAuth.mockResolvedValue({ id: seller._id.toString() })
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'yo' }),
          headers: { 'Content-Length': '1' },
        })

        await PUT(request, { params: { id: discussion._id.toString() } })

        const { discussions } = (await User.findById(seller._id).lean().exec())!

        await resetEntities()

        expect(discussions[0].hidden).toBe(false)
      })

      it("updates the buyer's discussion", async () => {
        await User.updateOne(
          { _id: buyer._id, 'discussions.id': discussion._id },
          { $set: { 'discussions.$.hidden': true } }
        )
          .lean()
          .exec()

        mockAuth.mockResolvedValue({ id: seller._id.toString() })
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'yo' }),
          headers: { 'Content-Length': '1' },
        })

        await PUT(request, { params: { id: discussion._id.toString() } })

        const { discussions } = (await User.findById(buyer._id).lean().exec())!

        await resetEntities()

        expect(discussions[0].hidden).toBe(false)
        expect(discussions[0].hasNewMessage).toBe(true)
      })

      test('500 - notifying the seller about the new message failed', async () => {
        const session = { id: seller._id.toString() }

        mockAuth.mockResolvedValue(session)
        mockDbConnect.mockResolvedValue()
        mockVerifyCsrfTokens.mockReturnValue(true)
        mockPusherTrigger.mockRejectedValue().mockResolvedValueOnce()

        const request = new NextRequest('http://-', {
          method: 'PUT',
          body: JSON.stringify({ message: 'yo' }),
          headers: { 'Content-Length': '1' },
        })

        const params = { params: { id: discussion._id.toString() } }
        const response = await PUT(request, params)
        const data = await response.json()

        await resetEntities()

        expect(mockPusherTrigger).toHaveBeenNthCalledWith(
          2,
          buyer.channelName,
          'message:new',
          ''
        )

        expect(response).toHaveProperty('status', 500)
        expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
      })
    })

    test('204 - new message added to the discussion', async () => {
      const session = { id: buyer._id.toString() }

      mockAuth.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue()
      mockVerifyCsrfTokens.mockReturnValue(true)

      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message: 'hi' }),
        headers: { 'Content-Length': '1' },
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const { messages } = (await Discussion.findById(discussion._id)
        .lean()
        .exec())!

      await resetEntities()

      expect(response).toHaveProperty('status', 204)
      expect(response.body).toBeNull()
      expect(messages[messages.length - 1].message).toBe('hi')
    })
  })

  describe('update the unseen messages', () => {
    test('204 - last messages seen', async () => {
      await User.updateOne(
        { _id: buyer._id, 'discussions.id': discussion._id },
        { $set: { 'discussions.$.hasNewMessage': true } }
      )
        .lean()
        .exec()

      await Discussion.updateOne(
        { _id: discussion._id, 'messages.userId': buyer._id },
        { $set: { 'messages.$.seen': true } }
      )
        .lean()
        .exec()

      await Discussion.updateOne(
        { _id: discussion._id },
        {
          $push: {
            messages: [
              { message: 'a', userId: seller._id, seen: true },
              { message: 'b', userId: seller._id, seen: false },
              { message: 'c', seen: false },
            ],
          },
        }
      )
        .lean()
        .exec()

      const session = { id: buyer._id.toString() }

      mockAuth.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue()
      mockVerifyCsrfTokens.mockReturnValue(true)

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)

      const { discussions } = (await User.findById(buyer._id).lean().exec())!
      const { messages } = (await Discussion.findById(discussion._id)
        .lean()
        .exec())!

      await resetEntities()

      expect(response).toHaveProperty('status', 204)
      expect(response.body).toBeNull()
      expect(discussions[0].hasNewMessage).toBe(false)
      expect(messages[0].seen).toBe(true)
      expect(messages[1].seen).toBe(true)
      expect(messages[2].seen).toBe(true)
      expect(messages[3].seen).toBe(true)
    })
  })
})

describe('DELETE', () => {
  test('422 - invalid id', async () => {
    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: 'invalid id' } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: PARAMS_INVALID })
  })

  test('401 - unauthorized', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - discussion not found', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: DISCUSSION_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const session = { id: new mongoose.Types.ObjectId().toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('204 - discussion deleted', async () => {
    const session = { id: buyer._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await DELETE(request, params)

    await resetEntities()

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(await Discussion.findById(discussion._id).lean().exec()).toBeNull()
  })
})
