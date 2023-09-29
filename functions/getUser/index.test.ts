/**
 * @jest-environment node
 */

import getUser from '.'

const mockFetch = jest.fn()

Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
})

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('not found')
  },
}))

it('returns the user found by the given id', async () => {
  const user = { id: '0' }

  mockFetch.mockResolvedValue({ ok: true, json: async () => user })

  expect(await getUser('0')).toEqual(user)
  expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost/api/users/0', {
    cache: 'no-store',
  })
})

it("doesn't found a user with the given id", async () => {
  mockFetch.mockResolvedValue({ ok: false })

  await expect(getUser('0')).rejects.toThrow('not found')
})
