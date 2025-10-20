/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'
import Page from './page'
// @ts-expect-error
import { mockAuth } from 'libs/auth'

jest.mock('libs/auth').mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

it('redirects to /profile if the user is already authenticated', async () => {
  mockAuth.mockResolvedValue({})

  await Page()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/profile')
})
