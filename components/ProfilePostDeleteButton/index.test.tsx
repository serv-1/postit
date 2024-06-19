import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePostDeleteButton from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'

const mockSetToast = jest.fn()
const server = setupServer()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next-auth/react', () => ({
    getCsrfToken: async () => 'token',
  }))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders correctly', () => {
  render(
    <ProfilePostDeleteButton
      postType="default"
      postId="0"
      postName="test"
      setPosts={() => {}}
    />
  )

  const btn = screen.getByLabelText('Delete test')

  expect(btn).toHaveAttribute('title', 'Delete test')
})

it('deletes the post on click', async () => {
  server.use(
    rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <ProfilePostDeleteButton
      postType="default"
      postId="0"
      postName="test"
      setPosts={mockSetPosts}
    />
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'Your post has been successfully deleted.',
  })

  const callback = mockSetPosts.mock.calls[0][0]
  const posts = [{ id: '0' }, { id: '1' }, { id: '2' }]

  expect(callback(posts)).not.toContain(posts[0])
})

it('deletes the favorite post on click', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ favPostId: '0' })

      return res(ctx.status(204))
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <ProfilePostDeleteButton
      postType="favorite"
      postId="0"
      postName="test"
      setPosts={mockSetPosts}
    />
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'The post has been removed from your favorite list.',
  })

  const callback = mockSetPosts.mock.calls[0][0]
  const posts = [{ id: '0' }, { id: '1' }, { id: '2' }]

  expect(callback(posts)).not.toContain(posts[0])
})

it('renders an error if the server fails to delete the post', async () => {
  server.use(
    rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <ProfilePostDeleteButton
      postType="default"
      postId="0"
      postName="test"
      setPosts={mockSetPosts}
    />
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'error',
    error: true,
  })

  expect(mockSetPosts).not.toHaveBeenCalled()
})

it('renders an error if the server fails to delete the favorite post', async () => {
  server.use(
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <ProfilePostDeleteButton
      postType="favorite"
      postId="0"
      postName="test"
      setPosts={mockSetPosts}
    />
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'error',
    error: true,
  })

  expect(mockSetPosts).not.toHaveBeenCalled()
})
