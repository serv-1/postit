/**
 * @jest-environment node
 */

import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import Page, { generateMetadata } from './page'
import getPost from 'functions/getPost'
import getUser from 'functions/getUser'
import getUserPosts from 'functions/getUserPosts'
import { Post, User, UserPost } from 'types'
import { mockGetServerSession } from '__mocks__/next-auth'

jest
  .mock('app/pages/post', () => ({
    __esModule: true,
    default: () => null,
  }))
  .mock('functions/getPost', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getUserPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next-auth')
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>
const mockGetUserPosts = getUserPosts as jest.MockedFunction<
  typeof getUserPosts
>

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetPost.mockResolvedValue({ name: 'table' } as Post)

    expect(
      await generateMetadata({ params: { id: '0', name: 'table' } })
    ).toEqual({ title: 'table - PostIt' })

    expect(mockGetPost).toHaveBeenNthCalledWith(1, '0')
  })
})

describe('<Page />', () => {
  it("throws an error if the post hasn't been found", async () => {
    mockGetPost.mockResolvedValue(undefined)

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow(
      POST_NOT_FOUND
    )

    expect(mockGetPost).toHaveBeenNthCalledWith(1, '0')
  })

  it("throws an error if the post's author hasn't been found", async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser.mockResolvedValue(undefined)

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow(
      USER_NOT_FOUND
    )

    expect(mockGetUser).toHaveBeenNthCalledWith(1, '1')
  })

  it("throws an error if one of the user's posts hasn't been found", async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser.mockResolvedValue({ postIds: ['0', '1'] } as User)
    mockGetUserPosts.mockResolvedValue(undefined)

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow(
      POST_NOT_FOUND
    )

    expect(mockGetUserPosts).toHaveBeenNthCalledWith(1, ['1'])
  })

  it("throws an error if the authenticated user hasn't been found", async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser
      .mockResolvedValue(undefined)
      .mockResolvedValueOnce({ postIds: ['0', '1'] } as User)
    mockGetUserPosts.mockResolvedValue([])
    mockGetServerSession.mockResolvedValue({ id: '2' })

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow(
      USER_NOT_FOUND
    )

    expect(mockGetUser.mock.calls[1][0]).toBe('2')
  })

  it('passes the post and the user to <PostPage />', async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser
      .mockResolvedValue({ name: 'bob' } as User)
      .mockResolvedValueOnce({
        id: '1',
        name: 'john',
        postIds: ['0', '1'],
      } as User)
    mockGetUserPosts.mockResolvedValue([{ name: 'table' }] as UserPost[])
    mockGetServerSession.mockResolvedValue({ id: '2' })

    expect((await Page({ params: { id: '0', name: 'table' } })).props).toEqual({
      post: {
        userId: '1',
        user: { id: '1', name: 'john', posts: [{ name: 'table' }] },
      },
      user: { name: 'bob' },
    })
  })

  it('only passes the post to <PostPage />', async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser.mockResolvedValue({
      id: '1',
      name: 'john',
      postIds: ['0', '1'],
    } as User)
    mockGetUserPosts.mockResolvedValue([{ name: 'table' }] as UserPost[])
    mockGetServerSession.mockResolvedValue(null)

    expect((await Page({ params: { id: '0', name: 'table' } })).props).toEqual({
      post: {
        userId: '1',
        user: { id: '1', name: 'john', posts: [{ name: 'table' }] },
      },
    })

    expect(mockGetUser).toBeCalledTimes(1)
  })
})
