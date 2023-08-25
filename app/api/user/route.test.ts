/**
 * @jest-environment node
 */

import err from 'utils/constants/errors'
import { POST, PUT, DELETE } from './route'
import { MongoServerError } from 'mongodb'
import { Types } from 'mongoose'
import { NextRequest } from 'next/server'
// prettier-ignore
// @ts-expect-error
import { mockDeleteOneUser, mockFindUserById, mockSaveUser, mockUpdateOneUser } from 'models/User'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'utils/functions/verifyCsrfTokens'
// @ts-expect-error
import { mockDeleteImage } from 'utils/functions/deleteImage'
// @ts-expect-error
import { mockServerPusherTrigger } from 'utils/functions/getServerPusher'

jest
  .mock('models/User')
  .mock('utils/functions/dbConnect')
  .mock('next-auth')
  .mock('utils/functions/verifyCsrfTokens')
  .mock('utils/functions/deleteImage')
  .mock('utils/functions/getServerPusher')
  .mock('utils/functions/hashPassword')

describe('POST', () => {
  test('422 - invalid json', async () => {
    const request = new Request('http://-', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'bob',
        email: 'bob@bob.bob',
        password: 'password of bob',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('500 - user creation failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockSaveUser.mockRejectedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'bob',
        email: 'bob@bob.bob',
        password: 'password of bob',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('422 - email taken', async () => {
    mockSaveUser.mockRejectedValue(new MongoServerError({ code: 11000 }))
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'bob',
        email: 'bob@bob.bob',
        password: 'password of bob',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({
      name: 'email',
      message: err.EMAIL_USED,
    })
  })

  test('201 - user creation succeeded', async () => {
    const user = { _id: new Types.ObjectId() }

    mockDbConnect.mockResolvedValue({})
    mockSaveUser.mockResolvedValue(user)

    const body = {
      name: 'bob',
      email: 'bob@bob.bob',
      password: 'password of bob',
    }

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(mockSaveUser).toHaveBeenNthCalledWith(1, body)
    expect(response).toHaveProperty('status', 201)
    expect(response.headers.get('Location')).toBe('/profile')
    expect(data).toEqual({ id: user._id.toString() })
  })
})

describe('PUT', () => {
  test('401 - unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', {
      method: 'PUT',
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  test('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({}),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message')
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'joe',
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'joe',
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('204 - name updated', async () => {
    const session = { id: 'sessId' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})

    const name = 'joe'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', name }),
    })

    const response = await PUT(request)

    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      { name }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  test('500 - update failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'joe',
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('422 - email taken', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockRejectedValue(new MongoServerError({ code: 11000 }))

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        email: 'joe@test.com',
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.EMAIL_USED })
  })

  test('204 - email updated', async () => {
    const session = { id: 'sessId' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})

    const email = 'joe@test.com'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', email }),
    })

    const response = await PUT(request)

    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      { email }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  test('204 - password updated', async () => {
    const session = { id: 'sessId' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})

    const password = '0123456789'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', password }),
    })

    const response = await PUT(request)

    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      { password: 'hashed' + password }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  test('500 - find user by id failed', async () => {
    const session = { id: 'sessId' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', image: 'key' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, session.id)
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('204 - image updated', async () => {
    const session = { id: 'sessId' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue({})

    const image = 'new'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', image }),
    })

    const response = await PUT(request)

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, session.id)
    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      { image }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  it('deletes the old image before updating it', async () => {
    const user = { image: 'old' }

    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)
    mockDeleteImage.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        image: 'new',
      }),
    })

    await PUT(request)

    expect(mockDeleteImage).toHaveBeenNthCalledWith(1, user.image)
  })

  test('500 - old image deletion failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue({ image: 'old' })
    mockDeleteImage.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', image: 'new' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('204 - add favorite post', async () => {
    const session = { id: 'sessId' }
    const user = { favPostIds: [] }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)

    const favPostId = new Types.ObjectId().toString()
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', favPostId }),
    })

    const response = await PUT(request)

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, session.id)
    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      { $push: { favPostIds: favPostId } }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  test('204 - delete favorite post', async () => {
    const session = { id: 'sessId' }
    const favPostId = new Types.ObjectId()
    const user = { favPostIds: [favPostId] }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        favPostId: favPostId.toString(),
      }),
    })

    const response = await PUT(request)

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, session.id)
    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      { $pull: { favPostIds: favPostId.toString() } }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  test("500 - 'discussion-deleted' pusher event triggering failed", async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue({})
    mockServerPusherTrigger.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        discussionId: new Types.ObjectId().toString(),
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it("triggers a 'discussion-deleted' pusher event", async () => {
    const session = { channelName: 'chanName' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue({})
    mockServerPusherTrigger.mockRejectedValue({})

    const discussionId = new Types.ObjectId().toString()
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', discussionId }),
    })

    await PUT(request)

    expect(mockServerPusherTrigger).toHaveBeenNthCalledWith(
      1,
      'private-' + session.channelName,
      'discussion-deleted',
      discussionId
    )
  })

  test('204 - add discussion', async () => {
    const session = { id: 'sessId', channelName: 'chanName' }
    const user = { discussionIds: [] }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)
    mockServerPusherTrigger.mockResolvedValue({})

    const discussionId = new Types.ObjectId().toString()
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', discussionId }),
    })

    const response = await PUT(request)

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, session.id)
    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      {
        $push: { discussionIds: discussionId },
        hasUnseenMessages: false,
      }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  test('204 - delete discussion', async () => {
    const session = { id: 'sessId', channelName: 'chanName' }
    const discussionId = new Types.ObjectId()
    const user = { discussionIds: [discussionId] }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockUpdateOneUser.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)
    mockServerPusherTrigger.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        discussionId: discussionId.toString(),
      }),
    })

    const response = await PUT(request)

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, session.id)
    expect(mockUpdateOneUser).toHaveBeenNthCalledWith(
      1,
      { _id: session.id },
      {
        $pull: { discussionIds: discussionId.toString() },
        hasUnseenMessages: false,
      }
    )

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})

describe('DELETE', () => {
  test('401 - unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', {
      method: 'DELETE',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  test('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  test('422 - csrf token undefined', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({}),
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  test('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('500 - delete one user failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteOneUser.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('204 - user deletion succeeded', async () => {
    const session = { id: 'sessId' }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteOneUser.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })

    const response = await DELETE(request)

    expect(mockDeleteOneUser).toHaveBeenNthCalledWith(1, { _id: session.id })
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})
