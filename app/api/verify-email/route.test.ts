/**
 * @jest-environment node
 */

import {
  DATA_INVALID,
  INTERNAL_SERVER_ERROR,
  EMAIL_UNKNOWN,
} from 'constants/errors'
import { POST } from './route'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
import User, { type UserDoc } from 'models/User'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

jest.mock('libs/pusher/server').mock('functions/dbConnect')

let mongoServer: MongoMemoryServer
let user: UserDoc

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())

  user = await new User({
    name: 'john',
    email: 'john@test.com',
    password: '0123456789',
    image: 'john.jpg',
    postIds: [],
    favPostIds: [],
    discussions: [],
  }).save()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('POST', () => {
  test('422 - invalid json', async () => {
    const request = new Request('http://-', {
      method: 'POST',
    })

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
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('422 - email unknown', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'jane@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: EMAIL_UNKNOWN })
  })

  test('204 - valid email', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})
