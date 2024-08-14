/**
 * @jest-environment node
 */

import Page from './page'
import { redirect } from 'next/navigation'
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

it('redirects to /authentication if the user is unauthenticated', async () => {
  mockGetServerSession.mockResolvedValue(null)
  mockRedirect.mockImplementation(() => {
    throw new Error()
  })

  await expect(Page()).rejects.toThrow()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
})
