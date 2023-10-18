/**
 * @jest-environment node
 */

import getPost from 'functions/getPost'
import Page, { generateMetadata } from './page'
import { redirect } from 'next/navigation'
import { Post } from 'types'
import { mockGetServerSession } from '__mocks__/next-auth'
import { POST_NOT_FOUND } from 'constants/errors'

jest
  .mock('functions/getPost', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))
  .mock('app/pages/postUpdate', () => ({
    __esModule: true,
    default: () => null,
  }))
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))
  .mock('next-auth')

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetPost.mockResolvedValue({ name: 'table' } as Post)

    expect(
      await generateMetadata({ params: { id: '0', name: 'table' } })
    ).toEqual({ title: 'Update table - PostIt' })
  })
})

describe('<Page />', () => {
  it('redirects to /authentication if the user is unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)
    mockRedirect.mockImplementation(() => {
      throw new Error()
    })

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow()

    expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
  })

  it("throws an error if the post hasn't been found", async () => {
    mockGetServerSession.mockResolvedValue({})
    mockGetPost.mockResolvedValue(undefined)

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow(
      POST_NOT_FOUND
    )

    expect(mockGetPost).toHaveBeenNthCalledWith(1, '0')
  })

  it('passes the post to <UpdatePost />', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockGetPost.mockResolvedValue({ name: 'table' } as Post)

    expect((await Page({ params: { id: '0', name: 'table' } })).props).toEqual({
      post: { name: 'table' },
    })
  })
})
