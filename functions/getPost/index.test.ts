/**
 * @jest-environment node
 */

import getPost from '.'

const mockFetch = jest.fn()

Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
})

it('returns the post found by the given id', async () => {
  const post = { id: '0' }

  mockFetch.mockResolvedValue({ ok: true, json: async () => post })

  expect(await getPost('0')).toEqual(post)
  expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost/api/posts/0', {
    cache: 'no-store',
  })
})

it("returns undefined if the post hasn't been found", async () => {
  mockFetch.mockResolvedValue({ ok: false })

  expect(await getPost('0')).toBeUndefined()
})
