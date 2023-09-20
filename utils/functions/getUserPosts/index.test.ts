/**
 * @jest-environment node
 */

import type { Post } from 'types'
import getUserPosts from '.'
import getPost from 'utils/functions/getPost'

jest.mock('utils/functions/getPost', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>

it("returns the users's posts found by the given ids", async () => {
  const posts = [
    {
      id: '0',
      name: 'table',
      price: 40,
      address: 'Paris',
      images: ['table1', 'table2'],
      description: 'magnificent table',
    },
    {
      id: '1',
      name: 'chair',
      price: 10,
      address: 'Oslo',
      images: ['chair1', 'chair2'],
      description: 'magnificent chair',
    },
  ] as Post[]

  mockGetPost.mockResolvedValueOnce(posts[0]).mockResolvedValueOnce(posts[1])

  const userPosts = await getUserPosts(['0', '1'])

  expect(userPosts[0]).toEqual({
    id: '0',
    name: 'table',
    price: 40,
    address: 'Paris',
    image: 'table1',
  })

  expect(userPosts[1]).toEqual({
    id: '1',
    name: 'chair',
    price: 10,
    address: 'Oslo',
    image: 'chair1',
  })

  expect(mockGetPost.mock.calls[0][0]).toBe('0')
  expect(mockGetPost.mock.calls[1][0]).toBe('1')
})
