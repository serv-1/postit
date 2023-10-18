/**
 * @jest-environment node
 */

import type { Post } from 'types'
import getUserPosts from '.'
import getPost from 'functions/getPost'

jest.mock('functions/getPost', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>

it("returns the user's posts found by the given ids", async () => {
  mockGetPost
    .mockResolvedValueOnce({
      id: '0',
      name: 'table',
      price: 40,
      address: 'Paris',
      images: ['table1', 'table2'],
      description: 'magnificent table',
    } as Post)
    .mockResolvedValueOnce({
      id: '1',
      name: 'chair',
      price: 10,
      address: 'Oslo',
      images: ['chair1', 'chair2'],
      description: 'magnificent chair',
    } as Post)

  expect(await getUserPosts(['0', '1'])).toEqual([
    { id: '0', name: 'table', price: 40, address: 'Paris', image: 'table1' },
    { id: '1', name: 'chair', price: 10, address: 'Oslo', image: 'chair1' },
  ])

  expect(mockGetPost.mock.calls[0][0]).toBe('0')
  expect(mockGetPost.mock.calls[1][0]).toBe('1')
})

it("returns undefined if one of the posts haven't been found", async () => {
  mockGetPost
    .mockResolvedValueOnce({
      id: '0',
      name: 'table',
      price: 40,
      address: 'Paris',
      images: ['table1', 'table2'],
      description: 'magnificent table',
    } as Post)
    .mockResolvedValueOnce(undefined)

  expect(await getUserPosts(['0', '1'])).toBeUndefined()
})
