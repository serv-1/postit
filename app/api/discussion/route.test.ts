/**
 * @jest-environment node
 */

import { POST } from './route'
import { NextRequest } from 'next/server'
import err from 'utils/constants/errors'
import { Types } from 'mongoose'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockServerPusherTrigger } from 'utils/functions/getServerPusher'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'utils/functions/verifyCsrfTokens'
// @ts-expect-error
import { mockFindOneDiscussion, mockSaveDiscussion } from 'models/Discussion'
// @ts-expect-error
import { mockFindUserById } from 'models/User'

jest
  .mock('next-auth')
  .mock('models/Discussion')
  .mock('models/User')
  .mock('utils/functions/dbConnect')
  .mock('utils/functions/getServerPusher')
  .mock('utils/functions/verifyCsrfTokens')

describe('POST', () => {
  it('401 - unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  it('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'POST' })
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
    expect(data).toHaveProperty('message')
  })

  it('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        message: 'yo',
        postId: new Types.ObjectId().toString(),
        sellerId: new Types.ObjectId().toString(),
        postName: 'table',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  it("422 - the authenticated user can't be the seller", async () => {
    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message: 'yo',
        postId: new Types.ObjectId().toString(),
        sellerId: session.id,
        postName: 'table',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.ID_INVALID })
  })

  it('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message: 'yo',
        postId: new Types.ObjectId().toString(),
        sellerId: new Types.ObjectId().toString(),
        postName: 'table',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - find one discussion failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message: 'yo',
        postId: new Types.ObjectId().toString(),
        sellerId: new Types.ObjectId().toString(),
        postName: 'table',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('409 - discussion already exists', async () => {
    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockResolvedValue({})

    const postId = new Types.ObjectId().toString()
    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message: 'yo',
        postId,
        sellerId: new Types.ObjectId().toString(),
        postName: 'table',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneDiscussion).toHaveBeenNthCalledWith(1, {
      buyerId: session.id,
      postId,
    })
    expect(response).toHaveProperty('status', 409)
    expect(data).toEqual({ message: err.DISCUSSION_ALREADY_EXISTS })
  })

  it('500 - discussion creation failed', async () => {
    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockResolvedValue(null)
    mockSaveDiscussion.mockRejectedValue({})

    const postId = new Types.ObjectId().toString()
    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message: 'yo',
        postId,
        sellerId: new Types.ObjectId().toString(),
        postName: 'table',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneDiscussion).toHaveBeenNthCalledWith(1, {
      buyerId: session.id,
      postId,
    })
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - find seller by id failed', async () => {
    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockResolvedValue(null)
    mockSaveDiscussion.mockResolvedValue({})
    mockFindUserById.mockRejectedValue({})

    const message = 'yo'
    const postId = new Types.ObjectId().toString()
    const sellerId = new Types.ObjectId().toString()
    const postName = 'table'
    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message,
        postId,
        sellerId,
        postName,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneDiscussion).toHaveBeenNthCalledWith(1, {
      buyerId: session.id,
      postId,
    })
    expect(mockSaveDiscussion).toHaveBeenNthCalledWith(1, {
      messages: [{ message, userId: session.id }],
      buyerId: session.id,
      sellerId,
      postId,
      postName,
    })
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('404 - seller not found', async () => {
    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockResolvedValue(null)
    mockSaveDiscussion.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(null)

    const message = 'yo'
    const postId = new Types.ObjectId().toString()
    const sellerId = new Types.ObjectId().toString()
    const postName = 'table'
    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message,
        postId,
        sellerId,
        postName,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneDiscussion).toHaveBeenNthCalledWith(1, {
      buyerId: session.id,
      postId,
    })
    expect(mockSaveDiscussion).toHaveBeenNthCalledWith(1, {
      messages: [{ message, userId: session.id }],
      buyerId: session.id,
      sellerId,
      postId,
      postName,
    })
    expect(mockFindUserById).toHaveBeenNthCalledWith(1, sellerId)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: err.USER_NOT_FOUND })
  })

  it('500 - "discussion-created" pusher event triggering failed', async () => {
    const session = { id: new Types.ObjectId().toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockResolvedValue(null)
    mockSaveDiscussion.mockResolvedValue({})
    mockFindUserById.mockResolvedValue({})
    mockServerPusherTrigger.mockRejectedValue({})

    const message = 'yo'
    const postId = new Types.ObjectId().toString()
    const sellerId = new Types.ObjectId().toString()
    const postName = 'table'
    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message,
        postId,
        sellerId,
        postName,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneDiscussion).toHaveBeenNthCalledWith(1, {
      buyerId: session.id,
      postId,
    })
    expect(mockSaveDiscussion).toHaveBeenNthCalledWith(1, {
      messages: [{ message, userId: session.id }],
      buyerId: session.id,
      sellerId,
      postId,
      postName,
    })
    expect(mockFindUserById).toHaveBeenNthCalledWith(1, sellerId)
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('201 - discussion created', async () => {
    const session = {
      id: new Types.ObjectId().toString(),
      channelName: 'chanName',
    }
    const discussion = { _id: new Types.ObjectId() }
    const seller = { channelName: 'seller channel name' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindOneDiscussion.mockResolvedValue(null)
    mockSaveDiscussion.mockResolvedValue(discussion)
    mockFindUserById.mockResolvedValue(seller)
    mockServerPusherTrigger.mockResolvedValue({})

    const message = 'yo'
    const postId = new Types.ObjectId().toString()
    const sellerId = new Types.ObjectId().toString()
    const postName = 'table'
    const request = new NextRequest('http://-', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: 'token',
        message,
        postId,
        sellerId,
        postName,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneDiscussion).toHaveBeenNthCalledWith(1, {
      buyerId: session.id,
      postId,
    })
    expect(mockSaveDiscussion).toHaveBeenNthCalledWith(1, {
      messages: [{ message, userId: session.id }],
      buyerId: session.id,
      sellerId,
      postId,
      postName,
    })
    expect(mockFindUserById).toHaveBeenNthCalledWith(1, sellerId)
    expect(mockServerPusherTrigger).toHaveBeenNthCalledWith(
      1,
      ['private-' + session.channelName, 'private-' + seller.channelName],
      'discussion-created',
      { discussionId: discussion._id.toString(), userId: session.id }
    )
    expect(response).toHaveProperty('status', 201)
    expect(data).toEqual({ id: discussion._id.toString() })
  })
})
