/**
 * @jest-environment node
 */

import err from 'utils/constants/errors'
import { GET } from './route'
import { Types } from 'mongoose'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { UserDoc, mockFindUserById } from 'models/User'

jest.mock('models/User').mock('utils/functions/dbConnect')

describe('GET', () => {
  test('422 - invalid id', async () => {
    const request = new Request('http://-')
    const params = { params: { id: 'invalid id' } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.ID_INVALID })
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('500 - find user by id failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindUserById.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
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
    expect(data).toEqual({ message: err.USER_NOT_FOUND })
  })

  test('200 - get the user', async () => {
    const user: UserDoc = {
      _id: new Types.ObjectId(),
      name: 'john',
      email: 'john@test.com',
      hasUnseenMessages: false,
      channelName: 'channelName',
      image: 'john.jpeg',
      postIds: [],
      favPostIds: [],
      discussionIds: [],
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
      id: params.params.id,
      name: user.name,
      email: user.email,
      hasUnseenMessages: user.hasUnseenMessages,
      channelName: user.channelName,
      image: user.image,
      postIds: user.postIds,
      favPostIds: user.favPostIds,
      discussionIds: user.discussionIds,
    })
  })

  test('200 - get the user with some post ids, favorite post ids and discussion ids', async () => {
    const user: UserDoc = {
      _id: new Types.ObjectId(),
      name: 'john',
      email: 'john@test.com',
      hasUnseenMessages: false,
      channelName: 'channelName',
      image: 'john.jpeg',
      postIds: [new Types.ObjectId()],
      favPostIds: [new Types.ObjectId(), new Types.ObjectId()],
      discussionIds: [
        new Types.ObjectId(),
        new Types.ObjectId(),
        new Types.ObjectId(),
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
      id: params.params.id,
      name: user.name,
      email: user.email,
      hasUnseenMessages: user.hasUnseenMessages,
      channelName: user.channelName,
      image: user.image,
      postIds: user.postIds.map((id) => id.toString()),
      favPostIds: user.favPostIds.map((id) => id.toString()),
      discussionIds: user.discussionIds.map((id) => id.toString()),
    })
  })
})
