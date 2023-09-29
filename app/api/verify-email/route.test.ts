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
// @ts-expect-error
import { mockFindOneUser } from 'models/User'

jest.mock('models/User').mock('functions/dbConnect')

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

  test('500 - find user by email failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockRejectedValue({})

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
    mockFindOneUser.mockResolvedValue(null)

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: EMAIL_UNKNOWN })
  })

  test('204 - valid email', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockResolvedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)

    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})
