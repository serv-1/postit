/**
 * @jest-environment node
 */

import { GET, PUT, DELETE } from './route'
import { NextRequest } from 'next/server'
import { Types } from 'mongoose'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { mockServerPusherTriggerBatch } from 'functions/getServerPusher'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'
// prettier-ignore
// @ts-expect-error
import { mockFindDiscussionById, mockFindDiscussionByIdAndUpdate, mockDeleteOneDiscussion, mockFindDiscussion, DiscussionDoc } from 'models/Discussion'
// @ts-expect-error
import { mockFindUserById, mockFindUserByIdAndUpdate } from 'models/User'
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

jest
  .mock('next-auth')
  .mock('models/User')
  .mock('models/Discussion')
  .mock('functions/dbConnect')
  .mock('functions/getServerPusher')
  .mock('functions/verifyCsrfTokens')
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))

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
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test("422 - invalid search params' csrf token", async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-?csrfToken=token')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - find discussion by id failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockRejectedValue({})

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - discussion not found', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(null)

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindDiscussionById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: DISCUSSION_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const session = { id: new Types.ObjectId().toString() }

    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('500 - find buyer by id failed', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockRejectedValue({})

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - find seller by id failed', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockRejectedValue({}).mockResolvedValueOnce({})

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, discussion.buyerId)
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('200 - get the discussion', async () => {
    const buyer = {
      _id: new Types.ObjectId(),
      name: 'john',
      image: 'john.jpeg',
    }

    const seller = {
      _id: new Types.ObjectId(),
      name: 'bob',
      image: 'bob.jpeg',
    }

    const discussion: Required<DiscussionDoc> = {
      _id: new Types.ObjectId(),
      sellerId: seller._id,
      buyerId: buyer._id,
      postId: new Types.ObjectId(),
      postName: 'table',
      channelName: 'chanName',
      messages: [],
    }

    const session = { id: buyer._id.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindUserById.mock.calls[1][0]).toBe(discussion.sellerId)
    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      id: discussion._id.toString(),
      postId: discussion.postId.toString(),
      postName: discussion.postName,
      channelName: discussion.channelName,
      messages: discussion.messages,
      buyer: {
        id: buyer._id.toString(),
        name: buyer.name,
        image: buyer.image,
      },
      seller: {
        id: seller._id.toString(),
        name: seller.name,
        image: seller.image,
      },
    })
  })

  test('200 - get the discussion without a buyer', async () => {
    const seller = {
      _id: new Types.ObjectId(),
      name: 'bob',
      image: 'bob.jpeg',
    }

    const discussion: DiscussionDoc = {
      _id: new Types.ObjectId(),
      sellerId: seller._id,
      postId: new Types.ObjectId(),
      postName: 'table',
      channelName: 'chanName',
      messages: [],
    }

    const session = { id: seller._id.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(null)

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toHaveProperty('buyer', {
      id: undefined,
      name: '[DELETED]',
      image: undefined,
    })
  })

  test('200 - get the discussion without a seller', async () => {
    const buyer = {
      _id: new Types.ObjectId(),
      name: 'john',
      image: 'john.jpeg',
    }

    const discussion: DiscussionDoc = {
      _id: new Types.ObjectId(),
      buyerId: buyer._id,
      postId: new Types.ObjectId(),
      postName: 'table',
      channelName: 'chanName',
      messages: [],
    }

    const session = { id: buyer._id.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(null).mockResolvedValueOnce(buyer)

    const request = new NextRequest('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toHaveProperty('seller', {
      id: undefined,
      name: '[DELETED]',
      image: undefined,
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
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - find discussion by id failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - discussion not found', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(mockFindDiscussionById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: DISCUSSION_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const session = { id: new Types.ObjectId().toString() }

    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('500 - find buyer by id failed', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - find seller by id failed', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockRejectedValue({}).mockResolvedValueOnce({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, discussion.buyerId)
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test("409 - can't send a message if the buyer is null", async () => {
    const discussion = { sellerId: new Types.ObjectId() }
    const session = { id: discussion.sellerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue({}).mockResolvedValueOnce(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(mockFindUserById.mock.calls[1][0]).toBe(discussion.sellerId)
    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: CANNOT_SEND_MSG })
  })

  test("409 - can't send a message if the seller is null", async () => {
    const discussion = { buyerId: new Types.ObjectId() }
    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(null).mockResolvedValueOnce({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: CANNOT_SEND_MSG })
  })

  test("409 - can't send a message if the buyer has deleted the discussion", async () => {
    const discussion = {
      _id: new Types.ObjectId(),
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const buyer = { discussionIds: [] }
    const seller = { discussionIds: [discussion._id] }
    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: CANNOT_SEND_MSG })
  })

  test("409 - can't send a message if the seller has deleted the discussion", async () => {
    const discussion = {
      _id: new Types.ObjectId(),
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const buyer = { discussionIds: [discussion._id] }
    const seller = { discussionIds: [] }
    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: discussion._id.toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: CANNOT_SEND_MSG })
  })

  test('422 - invalid csrf token', async () => {
    const discussion = {
      _id: new Types.ObjectId(),
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const buyer = { discussionIds: [discussion._id] }
    const seller = { discussionIds: [discussion._id] }
    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
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
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
      }

      const buyer = { discussionIds: [discussion._id] }
      const seller = { discussionIds: [discussion._id] }
      const session = { id: discussion.buyerId.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)

      const request = new NextRequest('http://-', { method: 'PUT', body: '' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(response).toHaveProperty('status', 422)
      expect(data).toEqual({ message: DATA_INVALID })
    })

    test('422 - invalid request body', async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
      }

      const buyer = { discussionIds: [discussion._id] }
      const seller = { discussionIds: [discussion._id] }
      const session = { id: discussion.buyerId.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)

      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(response).toHaveProperty('status', 422)
      expect(data).toHaveProperty('message')
    })

    test('500 - find discussion by id and update failed', async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
      }

      const buyer = { discussionIds: [discussion._id] }
      const seller = { discussionIds: [discussion._id] }
      const session = { id: discussion.buyerId.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockRejectedValue({})

      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message: 'yo' }),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test('500 - find user by id and update failed', async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
      }

      const buyer = {
        _id: discussion.buyerId,
        discussionIds: [discussion._id],
      }

      const seller = {
        _id: discussion.sellerId,
        discussionIds: [discussion._id],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindUserByIdAndUpdate.mockRejectedValue({})

      const message = 'yo'
      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message }),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(mockFindDiscussionByIdAndUpdate).toHaveBeenNthCalledWith(
        1,
        params.params.id,
        { $push: { messages: [{ message, userId: session.id }] } }
      )

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test('500 - find discussion by id failed', async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
      }

      const buyer = {
        _id: discussion.buyerId,
        discussionIds: [discussion._id],
      }

      const seller = {
        _id: discussion.sellerId,
        discussionIds: [discussion._id],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById
        .mockRejectedValue({})
        .mockResolvedValueOnce(discussion)

      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindUserByIdAndUpdate.mockResolvedValue({})

      const message = 'yo'
      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message }),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(mockFindUserByIdAndUpdate).toHaveBeenNthCalledWith(
        1,
        seller._id.toString(),
        { hasUnseenMessages: true }
      )

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test('500 - pusher events triggering failed', async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
      }

      const buyer = {
        _id: discussion.buyerId,
        discussionIds: [discussion._id],
      }

      const seller = {
        _id: discussion.sellerId,
        discussionIds: [discussion._id],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById
        .mockResolvedValue({})
        .mockResolvedValueOnce(discussion)

      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindUserByIdAndUpdate.mockResolvedValue({})
      mockServerPusherTriggerBatch.mockRejectedValue({})

      const message = 'yo'
      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message }),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(mockFindDiscussionById.mock.calls[1][0]).toBe(params.params.id)
      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test("204 - buyer's message added", async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
        channelName: 'chanName',
      }

      const updatedDiscussion = {
        ...discussion,
        messages: [{ message: 'yo' }],
      }

      const buyer = {
        _id: discussion.buyerId,
        discussionIds: [discussion._id],
      }

      const seller = {
        _id: discussion.sellerId,
        discussionIds: [discussion._id],
        channelName: 'chanName',
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById
        .mockResolvedValue(updatedDiscussion)
        .mockResolvedValueOnce(discussion)

      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindUserByIdAndUpdate.mockResolvedValue(seller)
      mockServerPusherTriggerBatch.mockResolvedValue({})

      const message = 'yo'
      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message }),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)

      expect(mockServerPusherTriggerBatch).toHaveBeenNthCalledWith(1, [
        {
          channel: 'private-' + seller.channelName,
          name: 'new-message',
          data: '',
        },
        {
          channel: 'private-encrypted-' + discussion.channelName,
          name: 'new-message',
          data: updatedDiscussion.messages[
            updatedDiscussion.messages.length - 1
          ],
        },
      ])

      expect(response).toHaveProperty('status', 204)
      expect(response.body).toBeNull()
    })

    test("204 - seller's message added", async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
        channelName: 'chanName',
      }

      const updatedDiscussion = {
        ...discussion,
        messages: [{ message: 'yo' }],
      }

      const buyer = {
        _id: discussion.buyerId,
        discussionIds: [discussion._id],
        channelName: 'chanName',
      }

      const seller = {
        _id: discussion.sellerId,
        discussionIds: [discussion._id],
      }

      const session = { id: seller._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById
        .mockResolvedValue(updatedDiscussion)
        .mockResolvedValueOnce(discussion)

      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindUserByIdAndUpdate.mockResolvedValue(buyer)
      mockServerPusherTriggerBatch.mockResolvedValue({})

      const message = 'yo'
      const request = new NextRequest('http://-', {
        method: 'PUT',
        body: JSON.stringify({ message }),
      })

      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)

      expect(mockFindUserByIdAndUpdate.mock.calls[0][0]).toBe(
        buyer._id.toString()
      )

      expect(mockServerPusherTriggerBatch).toHaveBeenNthCalledWith(1, [
        {
          channel: 'private-' + buyer.channelName,
          name: 'new-message',
          data: '',
        },
        {
          channel: 'private-encrypted-' + discussion.channelName,
          name: 'new-message',
          data: updatedDiscussion.messages[
            updatedDiscussion.messages.length - 1
          ],
        },
      ])

      expect(response).toHaveProperty('status', 204)
      expect(response.body).toBeNull()
    })
  })

  describe('update the unseen messages', () => {
    test('500 - find discussion by id and update failed', async () => {
      const discussion = {
        _id: new Types.ObjectId(),
        buyerId: new Types.ObjectId(),
        sellerId: new Types.ObjectId(),
        messages: [],
      }

      const buyer = {
        _id: discussion.buyerId,
        discussionIds: [discussion._id],
      }

      const seller = {
        _id: discussion.sellerId,
        discussionIds: [discussion._id],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById.mockResolvedValue(seller).mockResolvedValueOnce(buyer)
      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockRejectedValue({})

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test('500 - find user by id failed', async () => {
      const discussionId = new Types.ObjectId()

      const buyer = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const seller = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const discussion = {
        _id: discussionId,
        buyerId: buyer._id,
        sellerId: seller._id,
        messages: [
          { userId: buyer._id, seen: true },
          { userId: buyer._id, seen: false },
          { userId: seller._id, seen: false },
        ],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById
        .mockRejectedValue({})
        .mockResolvedValueOnce(buyer)
        .mockResolvedValueOnce(seller)

      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(mockFindDiscussionByIdAndUpdate).toHaveBeenNthCalledWith(
        1,
        params.params.id,
        {
          $set: {
            messages: [
              discussion.messages[0],
              discussion.messages[1],
              { ...discussion.messages[2], seen: true },
            ],
          },
        }
      )

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test("500 - find user's discussions failed", async () => {
      const discussionId = new Types.ObjectId()

      const buyer = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const seller = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const discussion = {
        _id: discussionId,
        buyerId: buyer._id,
        sellerId: seller._id,
        messages: [{ userId: seller._id, seen: false }],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById
        .mockResolvedValue({})
        .mockResolvedValueOnce(buyer)
        .mockResolvedValueOnce(seller)

      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindDiscussion.mockRejectedValue({})

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(mockFindUserById.mock.calls[2][0]).toBe(session.id)
      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test('500 - find user by id and update failed', async () => {
      const discussionId = new Types.ObjectId()

      const buyer = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId, new Types.ObjectId()],
      }

      const seller = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const discussion = {
        _id: discussionId,
        buyerId: buyer._id,
        sellerId: seller._id,
        messages: [{ userId: seller._id, seen: false }],
      }

      const session = { id: buyer._id.toString() }

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById
        .mockResolvedValue(buyer)
        .mockResolvedValueOnce(buyer)
        .mockResolvedValueOnce(seller)

      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindDiscussion.mockResolvedValue([])
      mockFindUserByIdAndUpdate.mockRejectedValue({})

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)
      const data = await response.json()

      expect(mockFindDiscussion).toHaveBeenNthCalledWith(1, {
        _id: { $in: [buyer.discussionIds[1]] },
      })

      expect(response).toHaveProperty('status', 500)
      expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
    })

    test('204 - unseen messages updated but the user still have anothers', async () => {
      const discussionId = new Types.ObjectId()

      const buyer = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const seller = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const discussion = {
        _id: discussionId,
        buyerId: buyer._id,
        sellerId: seller._id,
        messages: [{ userId: seller._id, seen: false }],
      }

      const session = { id: buyer._id.toString() }

      const discussions = [
        { messages: [{ userId: buyer._id, seen: false }] },
        { messages: [{ userId: seller._id, seen: false }] },
      ]

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById
        .mockResolvedValue(buyer)
        .mockResolvedValueOnce(buyer)
        .mockResolvedValueOnce(seller)

      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindDiscussion.mockResolvedValue(discussions)

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)

      expect(mockFindUserByIdAndUpdate).not.toHaveBeenCalled()
      expect(response).toHaveProperty('status', 204)
      expect(response.body).toBeNull()
    })

    test('204 - the last unseen messages of the user have been updated', async () => {
      const discussionId = new Types.ObjectId()

      const buyer = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const seller = {
        _id: new Types.ObjectId(),
        discussionIds: [discussionId],
      }

      const discussion = {
        _id: discussionId,
        buyerId: buyer._id,
        sellerId: seller._id,
        messages: [{ userId: seller._id, seen: false }],
      }

      const session = { id: buyer._id.toString() }

      const discussions = [
        { messages: [{ userId: buyer._id, seen: true }] },
        { messages: [{ userId: seller._id, seen: true }] },
      ]

      mockGetServerSession.mockResolvedValue(session)
      mockDbConnect.mockResolvedValue({})
      mockFindDiscussionById.mockResolvedValue(discussion)
      mockFindUserById
        .mockResolvedValue(buyer)
        .mockResolvedValueOnce(buyer)
        .mockResolvedValueOnce(seller)

      mockVerifyCsrfTokens.mockReturnValue(true)
      mockFindDiscussionByIdAndUpdate.mockResolvedValue({})
      mockFindDiscussion.mockResolvedValue(discussions)
      mockFindUserByIdAndUpdate.mockResolvedValue({})

      const request = new NextRequest('http://-', { method: 'PUT' })
      const params = { params: { id: discussion._id.toString() } }
      const response = await PUT(request, params)

      expect(mockFindUserByIdAndUpdate).toHaveBeenNthCalledWith(1, session.id, {
        hasUnseenMessages: false,
      })

      expect(response).toHaveProperty('status', 204)
      expect(response.body).toBeNull()
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
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - find discussion by id failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - discussion not found', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(mockFindDiscussionById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: DISCUSSION_NOT_FOUND })
  })

  test('403 - forbidden', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: FORBIDDEN })
  })

  test('500 - delete one discussion failed', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockDeleteOneDiscussion.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('204 - discussion deleted', async () => {
    const discussion = {
      buyerId: new Types.ObjectId(),
      sellerId: new Types.ObjectId(),
    }

    const session = { id: discussion.buyerId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindDiscussionById.mockResolvedValue(discussion)
    mockDeleteOneDiscussion.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)

    expect(mockDeleteOneDiscussion).toHaveBeenNthCalledWith(1, {
      _id: params.params.id,
    })

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})
