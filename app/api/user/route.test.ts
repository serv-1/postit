/**
 * @jest-environment node
 */

import { POST, PUT, DELETE } from './route'
import mongoose from 'mongoose'
import { NextRequest } from 'next/server'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { mockAuth } from 'libs/auth'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'functions/verifyCsrfTokens'
// @ts-expect-error
import { mockDeleteImage } from 'functions/deleteImage'
import {
  DATA_INVALID,
  INTERNAL_SERVER_ERROR,
  EMAIL_USED,
  UNAUTHORIZED,
  CSRF_TOKEN_INVALID,
} from 'constants/errors'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { type UserDoc } from 'models/User'

jest
  .mock('libs/pusher/server')
  .mock('functions/dbConnect')
  .mock('libs/auth')
  .mock('functions/verifyCsrfTokens')
  .mock('functions/deleteImage')
  .mock('functions/hash')

let mongoServer: MongoMemoryServer
let user: UserDoc

async function populateDb() {
  user = await new User({
    name: 'john',
    email: 'john@test.com',
    password: '0123456789',
    postIds: [],
    favPostIds: [],
    discussionIds: [],
  }).save()
}

async function resetDb() {
  await User.deleteMany({})
  await populateDb()
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())
  await User.ensureIndexes()
  await populateDb()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('POST', () => {
  test('422 - invalid json', async () => {
    const request = new Request('http://-', { method: 'POST' })
    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
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
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('422 - email taken', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({
        name: 'bob',
        email: user.email,
        password: 'password of bob',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({
      name: 'email',
      message: EMAIL_USED,
    })

    await resetDb()
  })

  test('201 - user creation succeeded', async () => {
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
    const createdUser = (await User.findOne({ email: 'bob@bob.bob' })
      .lean()
      .exec())!

    expect(response).toHaveProperty('status', 201)
    expect(response.headers.get('Location')).toBe('/profile')
    expect(data).toEqual({ _id: createdUser._id.toString() })
  })
})

describe('PUT', () => {
  test('401 - unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('422 - invalid json', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  test('422 - invalid request body', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({}),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name: 'joe' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('204 - name updated', async () => {
    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const name = 'joe'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser).toHaveProperty('name', 'joe')

    await resetDb()
  })

  test('422 - email taken', async () => {
    const signedInUser = await new User({
      name: 'jane',
      email: 'jane@test.com',
      password: '0123456789',
      postIds: [],
      favPostIds: [],
      discussionIds: [],
    }).save()

    const session = { id: signedInUser._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ email: user.email }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: EMAIL_USED })

    await resetDb()
  })

  test('204 - email updated', async () => {
    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const email = 'john@john.com'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser).toHaveProperty('email', email)

    await resetDb()
  })

  test('204 - password updated', async () => {
    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const password = 'new password'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser).toHaveProperty('password', 'salt:' + password)

    await resetDb()
  })

  test('204 - image updated', async () => {
    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const image = 'john_profile'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ image }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser).toHaveProperty('image', image)

    await resetDb()
  })

  it('deletes the old image before updating it', async () => {
    await User.updateOne({ _id: user._id }, { image: 'old' }).lean().exec()

    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ image: 'new' }),
    })

    await PUT(request)

    expect(mockDeleteImage).toHaveBeenNthCalledWith(1, 'old')

    await resetDb()
  })

  test('500 - old image deletion failed', async () => {
    await User.updateOne({ _id: user._id }, { image: 'old' }).lean().exec()

    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockDeleteImage.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ image: 'new' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })

    await resetDb()
  })

  test('204 - add favorite post', async () => {
    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const favPostId = new mongoose.Types.ObjectId().toString()
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ favPostId }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser.favPostIds[0].toString()).toBe(favPostId)

    await resetDb()
  })

  test('204 - delete favorite post', async () => {
    const session = { id: user._id.toString() }
    const favPostId = new mongoose.Types.ObjectId()

    await User.updateOne(
      { _id: user._id },
      { $push: { favPostIds: favPostId } }
    )
      .lean()
      .exec()

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ favPostId: favPostId.toString() }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser.favPostIds[0]).toBeUndefined()

    await resetDb()
  })

  test('204 - hide a discussion', async () => {
    const session = { id: user._id.toString() }
    const discussionId = new mongoose.Types.ObjectId()

    await User.updateOne(
      { _id: user._id },
      { $push: { discussions: { id: discussionId, hidden: false } } }
    )
      .lean()
      .exec()

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ discussionId }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser.discussions[0].hidden).toBe(true)

    await resetDb()
  })

  test('204 - unhide a discussion', async () => {
    const session = { id: user._id.toString() }
    const discussionId = new mongoose.Types.ObjectId()

    await User.updateOne(
      { _id: user._id },
      { $push: { discussions: { id: discussionId, hidden: true } } }
    )
      .lean()
      .exec()

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue()

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ discussionId }),
    })

    const response = await PUT(request)
    const updatedUser = (await User.findById(user._id).lean().exec())!

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(updatedUser.discussions[0].hidden).toBe(false)

    await resetDb()
  })
})

describe('DELETE', () => {
  test('401 - unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: UNAUTHORIZED })
  })

  test('422 - invalid csrf token', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: CSRF_TOKEN_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockAuth.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const response = await DELETE(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('204 - user deletion succeeded', async () => {
    const session = { id: user._id.toString() }

    mockAuth.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const response = await DELETE(request)
    const deletedUser = await User.findById(user._id).lean().exec()

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
    expect(deletedUser).toBeNull()

    await resetDb()
  })
})
