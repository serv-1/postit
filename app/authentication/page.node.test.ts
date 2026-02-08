import { redirect } from 'next/navigation'
import Page from './page'

vi.mock('libs/auth', () => ({
  auth: async () => ({}),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const mockRedirect = vi.mocked(redirect)

it('redirects to /profile if the user is already authenticated', async () => {
  await Page()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/profile')
})
