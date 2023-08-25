/**
 * @jest-environment node
 */

import { Post } from 'types/common'
import getUserFavoritePosts from '.'
import getPost from 'utils/functions/getPost'

jest.mock('utils/functions/getPost', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>

it("returns the user's favorite posts found by the given ids", async () => {
  const posts = [
    { id: '0', name: 'table', images: ['table1', 'table2'], price: 40 },
    { id: '1', name: 'chair', images: ['chair1', 'chair2'], price: 10 },
  ] as Post[]

  mockGetPost.mockResolvedValueOnce(posts[0]).mockResolvedValueOnce(posts[1])

  const favoritePosts = await getUserFavoritePosts(['0', '1'])

  expect(favoritePosts[0]).toEqual({
    id: '0',
    name: 'table',
    image: 'table1',
  })

  expect(favoritePosts[1]).toEqual({
    id: '1',
    name: 'chair',
    image: 'chair1',
  })

  expect(mockGetPost.mock.calls[0][0]).toBe('0')
  expect(mockGetPost.mock.calls[1][0]).toBe('1')
})
