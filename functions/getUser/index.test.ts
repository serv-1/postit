/**
 * @jest-environment node
 */

import getUser from '.'

const mockFetch = jest.fn()

Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
})

it('returns the user found by the given id', async () => {
  const user = { id: '0' }

  mockFetch.mockResolvedValue({ ok: true, json: async () => user })

  expect(await getUser('0')).toEqual(user)
  expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost/api/users/0', {
    cache: 'no-store',
  })
})

it("returns undefined if the user hasn't been found", async () => {
  mockFetch.mockResolvedValue({ ok: false })

  expect(await getUser('0')).toBeUndefined()
})
