/**
 * @jest-environment node
 */

import { GET } from './route'
import mongoose from 'mongoose'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
import User, { type UserDoc } from 'models/User'
import {
  ID_INVALID,
  INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND,
} from 'constants/errors'
import { MongoMemoryServer } from 'mongodb-memory-server'

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

describe('GET', () => {
  test('422 - invalid id', async () => {
    const request = new Request('http://-')
    const params = { params: { id: 'invalid id' } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: ID_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: user._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - user not found', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new mongoose.Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: USER_NOT_FOUND })
  })

  test('200 - get the user', async () => {
    mockDbConnect.mockResolvedValue({})

    const request = new Request('http://-')
    const params = { params: { id: user._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      _id: params.params.id,
      name: user.name,
      email: user.email,
      channelName: user.channelName,
      image: user.image,
      postIds: user.postIds,
      favPostIds: user.favPostIds,
      discussions: user.discussions,
    })
  })
})
