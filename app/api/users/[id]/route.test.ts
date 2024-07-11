/**
 * @jest-environment node
 */

import { GET } from './route'
import { Types } from 'mongoose'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
// @ts-expect-error
import { type UserDoc, mockFindUserById } from 'models/User'
import {
  ID_INVALID,
  INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND,
} from 'constants/errors'

jest.mock('models/User').mock('functions/dbConnect')

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
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('500 - find user by id failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindUserById.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: INTERNAL_SERVER_ERROR })
  })

  test('404 - user not found', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(null)

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: USER_NOT_FOUND })
  })

  test('200 - get the user', async () => {
    const user: UserDoc = {
      _id: new Types.ObjectId(),
      name: 'john',
      email: 'john@test.com',
      channelName: 'channelName',
      image: 'john.jpeg',
      postIds: [],
      favPostIds: [],
      discussions: [],
    }

    mockDbConnect.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)

    const request = new Request('http://-')
    const params = { params: { id: user._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, params.params.id)
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

  test('200 - get the user with some post ids, favorite post ids and discussion ids', async () => {
    const user: UserDoc = {
      _id: new Types.ObjectId(),
      name: 'john',
      email: 'john@test.com',
      channelName: 'channelName',
      image: 'john.jpeg',
      postIds: [new Types.ObjectId()],
      favPostIds: [new Types.ObjectId(), new Types.ObjectId()],
      discussions: [
        {
          _id: new Types.ObjectId(),
          id: new Types.ObjectId(),
          hidden: false,
          hasNewMessage: false,
        },
        {
          _id: new Types.ObjectId(),
          id: new Types.ObjectId(),
          hidden: false,
          hasNewMessage: false,
        },
        {
          _id: new Types.ObjectId(),
          id: new Types.ObjectId(),
          hidden: false,
          hasNewMessage: false,
        },
      ],
    }

    mockDbConnect.mockResolvedValue({})
    mockFindUserById.mockResolvedValue(user)

    const request = new Request('http://-')
    const params = { params: { id: user._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindUserById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      _id: params.params.id,
      name: user.name,
      email: user.email,
      channelName: user.channelName,
      image: user.image,
      postIds: user.postIds.map((id) => id.toString()),
      favPostIds: user.favPostIds.map((id) => id.toString()),
      discussions: JSON.parse(JSON.stringify(user.discussions)),
    })
  })
})
