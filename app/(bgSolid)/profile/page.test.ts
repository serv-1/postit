/**
 * @jest-environment node
 */

import Page from './page'
import getUser from 'functions/getUser'
import getPosts from 'functions/getPosts'
import getUserFavoritePosts from 'functions/getUserFavoritePosts'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import { redirect } from 'next/navigation'
import { Post, User, UserFavoritePost } from 'types'
import { mockGetServerSession } from '__mocks__/next-auth'

jest
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getUserFavoritePosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('app/pages/profile', () => ({
    __esModule: true,
    default: () => null,
  }))
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))

const mockGetUserFavoritePosts = getUserFavoritePosts as jest.MockedFunction<
  typeof getUserFavoritePosts
>

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>
const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>

it('redirects to /authentication if the user is unauthenticated', async () => {
  mockGetServerSession.mockResolvedValue(null)
  mockRedirect.mockImplementation(() => {
    throw new Error()
  })

  await expect(Page()).rejects.toThrow()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
})

it("throws an error if the authenticated user hasn't been found", async () => {
  mockGetServerSession.mockResolvedValue({ id: '0' })
  mockGetUser.mockResolvedValue(undefined)

  await expect(Page()).rejects.toThrow(USER_NOT_FOUND)

  expect(mockGetUser).toHaveBeenNthCalledWith(1, '0')
})

it("throws an error if a post hasn't been found", async () => {
  mockGetServerSession.mockResolvedValue({ id: '0' })
  mockGetUser.mockResolvedValue({ postIds: ['0'] } as User)
  mockGetPosts.mockResolvedValue(undefined)

  await expect(Page()).rejects.toThrow(POST_NOT_FOUND)

  expect(mockGetPosts).toHaveBeenNthCalledWith(1, ['0'])
})

it("throws an error if a favorite post hasn't been found", async () => {
  mockGetServerSession.mockResolvedValue({ id: '0' })
  mockGetUser.mockResolvedValue({ favPostIds: ['0'] } as User)
  mockGetPosts.mockResolvedValue([])
  mockGetUserFavoritePosts.mockResolvedValue(undefined)

  await expect(Page()).rejects.toThrow(POST_NOT_FOUND)

  expect(mockGetUserFavoritePosts).toHaveBeenNthCalledWith(1, ['0'])
})

it('passes the user with its posts and favorite posts to <Profile />', async () => {
  mockGetServerSession.mockResolvedValue({ id: '0' })
  mockGetUser.mockResolvedValue({ id: '0', name: 'john' } as User)
  mockGetPosts.mockResolvedValue([{ name: 'table' }] as Post[])
  mockGetUserFavoritePosts.mockResolvedValue([
    { name: 'chair' },
  ] as UserFavoritePost[])

  expect((await Page()).props).toEqual({
    user: {
      id: '0',
      name: 'john',
      posts: [{ name: 'table' }],
      favPosts: [{ name: 'chair' }],
    },
  })
})
