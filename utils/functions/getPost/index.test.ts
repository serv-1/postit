/**
 * @jest-environment node
 */

import getPost from '.'

const mockFetch = jest.fn()

Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
})

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('not found')
  },
}))

it('returns the post found by the given id', async () => {
  const post = { id: '0' }

  mockFetch.mockResolvedValue({ ok: true, json: async () => post })

  expect(await getPost('0')).toEqual(post)
  expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost/api/posts/0', {
    cache: 'no-store',
  })
})

it("doesn't found a post with the given id", async () => {
  mockFetch.mockResolvedValue({ ok: false })

  await expect(getPost('0')).rejects.toThrow('not found')
})
