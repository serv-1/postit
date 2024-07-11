/**
 * @jest-environment node
 */

import Page from './page'
import getUser from 'functions/getUser'
import getPosts from 'functions/getPosts'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import { redirect } from 'next/navigation'
import type { User } from 'types'
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
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))

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
  mockGetUser.mockResolvedValue({ postIds: ['1'] } as User)
  mockGetPosts.mockResolvedValue(undefined)

  await expect(Page()).rejects.toThrow(POST_NOT_FOUND)

  expect(mockGetPosts).toHaveBeenCalledTimes(1)
  expect(mockGetPosts.mock.calls[0][0]).toEqual(['1'])
})

it("throws an error if a favorite post hasn't been found", async () => {
  mockGetServerSession.mockResolvedValue({ id: '0' })
  mockGetUser.mockResolvedValue({ postIds: ['1'], favPostIds: ['2'] } as User)
  mockGetPosts.mockResolvedValueOnce([]).mockResolvedValueOnce(undefined)

  await expect(Page()).rejects.toThrow(POST_NOT_FOUND)

  expect(mockGetPosts).toHaveBeenCalledTimes(2)
  expect(mockGetPosts.mock.calls[1][0]).toEqual(['2'])
})
