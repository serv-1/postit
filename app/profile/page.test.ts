/**
 * @jest-environment node
 */

import Page from './page'
import { redirect } from 'next/navigation'
// @ts-expect-error
import { mockAuth } from 'libs/auth'

jest
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('libs/auth')
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

it('redirects to /authentication if the user is unauthenticated', async () => {
  mockAuth.mockResolvedValue(null)
  mockRedirect.mockImplementation(() => {
    throw new Error()
  })

  await expect(Page()).rejects.toThrow()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
})
