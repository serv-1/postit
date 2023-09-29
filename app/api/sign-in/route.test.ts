/**
 * @jest-environment node
 */

import { POST } from './route'
import { Types } from 'mongoose'
import hashPassword from 'functions/hashPassword'
// @ts-expect-error
import { mockFindOneUser } from 'models/User'
// @ts-expect-error
import { mockDbConnect } from 'functions/dbConnect'
import {
  DATA_INVALID,
  INTERNAL_SERVER_ERROR,
  EMAIL_UNKNOWN,
  PASSWORD_REQUIRED,
  PASSWORD_INVALID,
} from 'constants/errors'

jest
  .unmock('functions/hashPassword')
  .mock('models/User')
  .mock('functions/dbConnect')

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

  test('500 - find one user failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockRejectedValue({})

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
    mockFindOneUser.mockResolvedValue(null)

    const email = 'bob@test.com'

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email, password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneUser).toHaveBeenNthCalledWith(1, { email })
    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ name: 'email', message: EMAIL_UNKNOWN })
  })

  test('422 - password undefined', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockResolvedValue({})

    const email = 'bob@test.com'

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email, password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneUser).toHaveBeenNthCalledWith(1, { email })
    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ name: 'password', message: PASSWORD_REQUIRED })
  })

  test('422 - invalid password', async () => {
    const user = { password: hashPassword('0123123123') }

    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockResolvedValue(user)

    const email = 'bob@test.com'
    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email, password: '0123456789' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneUser).toHaveBeenNthCalledWith(1, { email })
    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ name: 'password', message: PASSWORD_INVALID })
  })

  test('200 - user ready to sign in', async () => {
    const email = 'bob@test.com'
    const password = '0123456789'
    const user = {
      _id: new Types.ObjectId(),
      name: 'bob',
      email,
      password: hashPassword(password),
    }

    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockResolvedValue(user)

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(mockFindOneUser).toHaveBeenNthCalledWith(1, { email })
    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({ id: user._id.toString(), name: user.name, email })
  })
})
