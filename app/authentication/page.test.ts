/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'
import Page from './page'
import { mockGetServerSession } from '__mocks__/next-auth'

jest
  .mock('libs/nextAuth', () => ({
    nextAuthOptions: {},
  }))
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))
  .mock('next-auth')

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

it('redirects to /profile if the user is already authenticated', async () => {
  mockGetServerSession.mockResolvedValue({})

  await Page()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/profile')
})
