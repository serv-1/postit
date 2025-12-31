/**
 * @jest-environment node
 */

import { POST } from './route'
import mongoose from 'mongoose'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
import {
  DATA_INVALID,
  INTERNAL_SERVER_ERROR,
  EMAIL_UNKNOWN,
  PASSWORD_REQUIRED,
  PASSWORD_INVALID,
} from 'constants/errors'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { type UserDoc } from 'models/User'

jest.mock('libs/pusher/server').mock('functions/dbConnect')

let mongoServer: MongoMemoryServer
let user: UserDoc

async function populateDb() {
  user = await new User({
    name: 'john',
    email: 'john@test.com',
    password: '0123456789',
    postIds: [],
    favPostIds: [],
    discussions: [],
  }).save()
}

async function resetDb() {
  await User.deleteMany({})
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
      body: JSON.stringify({ email: 'a@a.a', password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('422 - email unknown', async () => {
    mockDbConnect.mockResolvedValue({})

    const email = 'bob@test.com'
    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email, password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ name: 'email', message: EMAIL_UNKNOWN })
  })

  test('422 - password undefined', async () => {
    await User.updateOne({ _id: user._id }, { password: '' }).lean().exec()

    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ name: 'password', message: PASSWORD_REQUIRED })

    await resetDb()
  })

  test('422 - invalid password', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: 'invalid pw' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ name: 'password', message: PASSWORD_INVALID })
  })

  test('200 - user ready to sign in', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })
  })
})
