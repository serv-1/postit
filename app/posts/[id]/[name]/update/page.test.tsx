/**
 * @jest-environment node
 */

import getPost from 'functions/getPost'
import Page, { generateMetadata } from './page'
import { redirect } from 'next/navigation'
import type { Post } from 'types'
// @ts-expect-error
import { mockAuth } from 'libs/auth'

jest
  .mock('functions/getPost', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))
  .mock('libs/auth')
  .mock('components/UpdatePostForm', () => ({
    __esModule: true,
    default: () => <form></form>,
  }))

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
    mockAuth.mockResolvedValue(null)
    mockRedirect.mockImplementation(() => {
      throw new Error()
    })

    await expect(Page({ params: { id: '0', name: 'table' } })).rejects.toThrow()

    expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
  })
})
