/**
 * @jest-environment node
 */

import { Post } from 'types'
import getPosts from '.'
import getPost from 'functions/getPost'

jest.mock('functions/getPost', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>

it('returns the posts found by the given ids', async () => {
  const posts = [{ id: '0' }, { id: '1' }] as Post[]

  mockGetPost.mockResolvedValueOnce(posts[0]).mockResolvedValueOnce(posts[1])

  expect(await getPosts(['0', '1'])).toEqual(posts)
  expect(mockGetPost.mock.calls[0][0]).toBe('0')
  expect(mockGetPost.mock.calls[1][0]).toBe('1')
})

it("returns undefined if one the posts haven't been found", async () => {
  mockGetPost
    .mockResolvedValueOnce({ id: '0' } as Post)
    .mockResolvedValueOnce(undefined)

  expect(await getPosts(['0', '1'])).toBeUndefined()
})
