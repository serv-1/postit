/**
 * @jest-environment node
 */

import type { Post } from 'types'
import getUserFavoritePosts from '.'
import getPost from 'functions/getPost'

jest.mock('functions/getPost', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>

it("returns the user's favorite posts found by the given ids", async () => {
  mockGetPost
    .mockResolvedValueOnce({
      id: '0',
      name: 'table',
      images: ['table1', 'table2'],
      price: 40,
    } as Post)
    .mockResolvedValueOnce({
      id: '1',
      name: 'chair',
      images: ['chair1', 'chair2'],
      price: 10,
    } as Post)

  expect(await getUserFavoritePosts(['0', '1'])).toEqual([
    { id: '0', name: 'table', image: 'table1' },
    { id: '1', name: 'chair', image: 'chair1' },
  ])

  expect(mockGetPost.mock.calls[0][0]).toBe('0')
  expect(mockGetPost.mock.calls[1][0]).toBe('1')
})

it("returns undefined if one the posts haven't been found", async () => {
  mockGetPost
    .mockResolvedValueOnce({
      id: '0',
      name: 'table',
      images: ['table1', 'table2'],
      price: 40,
    } as Post)
    .mockResolvedValueOnce(undefined)

  expect(await getUserFavoritePosts(['0', '1'])).toBeUndefined()
})
