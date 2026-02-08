import { redirect } from 'next/navigation'
import Page from './page'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error()
  }),
}))

vi.mock('libs/auth', () => ({
  auth: async () => null,
}))

vi.mock('components/CreatePostForm', () => ({
  default: () => '',
}))

const mockRedirect = vi.mocked(redirect)

it('redirects to /authentication if the user is unauthenticated', async () => {
  await expect(Page()).rejects.toThrow()

  expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
})
