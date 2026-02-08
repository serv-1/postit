import getPost from 'functions/getPost'
import Page, { generateMetadata } from './page'
import { redirect } from 'next/navigation'
import type { Post } from 'types'

vi.mock('functions/getPost', () => ({
  default: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error()
  }),
}))

vi.mock('components/UpdatePostForm', () => ({
  default: () => '',
}))

vi.mock('libs/auth', () => ({
  auth: async () => null,
}))

const mockGetPost = vi.mocked(getPost)
const mockRedirect = vi.mocked(redirect)

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetPost.mockResolvedValue({ name: 'table' } as Post)

    expect(
      await generateMetadata({
        params: Promise.resolve({ id: '0', name: 'table' }),
      }),
    ).toEqual({
      title: 'Update table - PostIt',
    })
  })
})

describe('<Page />', () => {
  it('redirects to /authentication if the user is unauthenticated', async () => {
    await expect(
      Page({ params: Promise.resolve({ id: '0', name: 'table' }) }),
    ).rejects.toThrow()

    expect(mockRedirect).toHaveBeenNthCalledWith(1, '/authentication')
  })
})
