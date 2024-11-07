/**
 * @jest-environment node
 */

import Token from 'models/Token'
import User, { type UserDoc } from 'models/User'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { POST } from './route'
import { DATA_INVALID, INTERNAL_SERVER_ERROR } from 'constants/errors'
// @ts-ignore
import { mockMailjetPostRequest } from 'libs/mailjet'
// @ts-ignore
import { mockDbConnect } from 'functions/dbConnect'

jest
  .mock('functions/dbConnect')
  .mock('functions/hash')
  .mock('libs/mailjet')
  .mock('libs/pusher/server')

let mongoServer: MongoMemoryServer
let user: UserDoc

async function populateDb() {
  user = await new User({
    name: 'john',
    email: 'john@test.com',
    password: 'azerty1234',
  }).save()
}

async function resetDb() {
  await User.deleteMany({})
  await Token.deleteMany({})
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
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue()

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toHaveProperty('message', INTERNAL_SERVER_ERROR)
  })

  test('204 - email sent', async () => {
    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    })

    const response = await POST(request)

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()

    const token = await Token.findOne({ userId: user._id }).lean().exec()

    expect(token?.token).toMatch(':')

    const message = mockMailjetPostRequest.mock.calls[0][0].Messages[0]

    expect(message.To[0].Email).toBe(user.email)

    const url = new URL(message.HTMLPart.split('"')[1])

    expect(url.searchParams.get('token')).not.toMatch(':')
    expect(url.searchParams.get('userId')).toBe(user._id.toString())

    await resetDb()
  })

  it('updates the token if one already exists', async () => {
    await new Token({ token: 'oldToken', userId: user._id }).save()

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    })

    await POST(request)

    const updatedToken = await Token.findOne({ userId: user._id }).lean().exec()

    expect(updatedToken?.token).not.toBe('oldToken')

    await resetDb()
  })

  it('always respond in 500ms', async () => {
    let request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    })

    let start = Date.now()
    await POST(request)
    let end = Date.now()

    expect(end - start).toBeGreaterThanOrEqual(500)

    request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    })

    start = Date.now()
    await POST(request)
    end = Date.now()

    expect(end - start).toBeGreaterThanOrEqual(500)

    await resetDb()
  })
})
