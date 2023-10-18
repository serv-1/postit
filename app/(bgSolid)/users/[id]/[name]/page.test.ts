/**
 * @jest-environment node
 */

import getUser from 'functions/getUser'
import Page, { generateMetadata } from './page'
import getPosts from 'functions/getPosts'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import { Post, User } from 'types'

jest
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>
const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetUser.mockResolvedValue({ name: 'john' } as User)

    expect(
      await generateMetadata({ params: { id: '0', name: 'john' } })
    ).toEqual({ title: "john's profile - PostIt" })
  })
})

describe('<Page />', () => {
  it("throws an error if the user hasn't been found", async () => {
    mockGetUser.mockResolvedValue(undefined)

    await expect(Page({ params: { id: '0', name: 'john' } })).rejects.toThrow(
      USER_NOT_FOUND
    )

    expect(mockGetUser).toHaveBeenNthCalledWith(1, '0')
  })

  it("throws an error if one of the user's posts hasn't been found", async () => {
    mockGetUser.mockResolvedValue({ postIds: ['0'] } as User)
    mockGetPosts.mockResolvedValue(undefined)

    await expect(Page({ params: { id: '0', name: 'john' } })).rejects.toThrow(
      POST_NOT_FOUND
    )

    expect(mockGetPosts).toHaveBeenNthCalledWith(1, ['0'])
  })

  it('passes the user and its posts to <PublicProfile />', async () => {
    mockGetUser.mockResolvedValue({ name: 'john', postIds: ['0'] } as User)
    mockGetPosts.mockResolvedValue([{ name: 'table' }] as Post[])

    expect((await Page({ params: { id: '0', name: 'john' } })).props).toEqual({
      user: { name: 'john', postIds: ['0'], posts: [{ name: 'table' }] },
    })
  })
})
