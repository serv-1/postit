/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'
import Page from './page'
import { mockGetServerSession } from '__mocks__/next-auth'

jest
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))
  .mock('next-auth')

const mockGetProviders = jest.spyOn(require('next-auth/react'), 'getProviders')
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

it('redirects to /profile if the user is already authenticated', async () => {
  mockGetServerSession.mockResolvedValue({})

  await Page()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/profile')
})

it('passes the providers to <Authentication />', async () => {
  mockGetServerSession.mockResolvedValue(null)
  mockGetProviders.mockResolvedValue({ google: {} })

  expect((await Page()).props).toEqual({ providers: { google: {} } })
})
