/**
 * @jest-environment node
 */

import { POST } from './route'
import err from 'utils/constants/errors'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { mockFindOneUser } from 'models/User'

jest.mock('models/User').mock('utils/functions/dbConnect')

describe('POST', () => {
  it('422 - invalid json', async () => {
    const request = new Request('http://-', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  it('422 - invalid request body', async () => {
    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message')
  })

  it('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - find user by email failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockRejectedValue({})

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('422 - email unknown', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindOneUser.mockResolvedValue(null)

    const request = new Request('http://-', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.EMAIL_UNKNOWN })
  })

  it('204 - valid email', async () => {
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
