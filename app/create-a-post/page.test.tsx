/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'
import Page from './page'
import { mockGetServerSession } from '__mocks__/next-auth'

jest
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))
  .mock('libs/nextAuth', () => ({
    nextAuthOptions: {},
  }))
  .mock('next-auth')
  .mock('components/CreatePostForm', () => ({
    __esModule: true,
    default: () => <form></form>,
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
