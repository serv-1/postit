/**
 * @jest-environment node
 */

import {
  DATA_INVALID,
  INTERNAL_SERVER_ERROR,
  TOKEN_INVALID,
  TOKEN_REQUIRED,
} from 'constants/errors'
import { PUT } from './route'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
// @ts-ignore
import { mockDbConnect } from 'functions/dbConnect'
import Token from 'models/Token'
import hash from 'functions/hash'

jest.mock('functions/dbConnect').mock('libs/pusher/server')

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('PUT', () => {
  it('422 - invalid json', async () => {
    const request = new Request('http://-', { method: 'PUT' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: DATA_INVALID })
  })

  it('422 - invalid request body', async () => {
    const request = new Request('http://-', {
      method: 'PUT',
      body: JSON.stringify({}),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message')
  })

  it('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue()

    const request = new Request('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        token: '0'.repeat(64),
        password: 'azerty1234',
        userId: new mongoose.Types.ObjectId(),
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toHaveProperty('message', INTERNAL_SERVER_ERROR)
  })

  it("422 - token doesn't exist", async () => {
    const request = new Request('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        token: '0'.repeat(64),
        password: 'azerty1234',
        userId: new mongoose.Types.ObjectId(),
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message', TOKEN_REQUIRED)
  })

  it('422 - invalid token', async () => {
    const token = await new Token({
      token: hash('0'.repeat(64)),
      userId: new mongoose.Types.ObjectId(),
    }).save()

    const request = new Request('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        token: '1'.repeat(64),
        password: 'azerty1234',
        userId: token.userId,
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message', TOKEN_INVALID)
  })

  it('204 - password updated', async () => {
    const token = '0'.repeat(64)

    const { userId } = await new Token({
      token: hash(token),
      userId: new mongoose.Types.ObjectId(),
    }).save()

    const request = new Request('http://-', {
      method: 'PUT',
      body: JSON.stringify({ token, password: 'azerty1234', userId }),
    })

    const response = await PUT(request)

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})
