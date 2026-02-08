import Page from './page'
import { redirect } from 'next/navigation'

vi.mock('functions/getUser', () => ({
  default: vi.fn(),
}))

vi.mock('functions/getPosts', () => ({
  default: vi.fn(),
}))

vi.mock('libs/auth', () => ({
  auth: async () => null,
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error()
  }),
}))

const mockRedirect = vi.mocked(redirect)

it('redirects to /authentication if the user is unauthenticated', async () => {
  await expect(Page()).rejects.toThrow()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
})
