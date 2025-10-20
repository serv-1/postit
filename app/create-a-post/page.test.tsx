/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'
import Page from './page'
// @ts-expect-error
import { mockAuth } from 'libs/auth'

jest
  .mock('next/navigation', () => ({
    redirect: jest.fn(),
  }))
  .mock('libs/auth')
  .mock('components/CreatePostForm', () => ({
    __esModule: true,
    default: () => <form></form>,
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
