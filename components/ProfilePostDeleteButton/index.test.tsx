import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePostDeleteButton from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import Toast from 'components/Toast'

const server = setupServer()

jest.mock('next-auth/react', () => ({
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
    http.delete('http://localhost/api/posts/:id', ({ request, params }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(params.id).toBe('0')

      return new HttpResponse(null, { status: 204 })
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <>
      <Toast />
      <ProfilePostDeleteButton
        postType="default"
        postId="0"
        postName="test"
        setPosts={mockSetPosts}
      />
    </>
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('Your post has been successfully deleted.')

  const callback = mockSetPosts.mock.calls[0][0]
  const posts = [{ _id: '0' }, { _id: '1' }, { _id: '2' }]

  expect(callback(posts)).not.toContain(posts[0])
})

it('deletes the favorite post on click', async () => {
  server.use(
    http.put('http://localhost/api/user', async ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({ favPostId: '0' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <>
      <Toast />
      <ProfilePostDeleteButton
        postType="favorite"
        postId="0"
        postName="test"
        setPosts={mockSetPosts}
      />
    </>
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'The post has been removed from your favorite list.'
  )

  const callback = mockSetPosts.mock.calls[0][0]
  const posts = [{ _id: '0' }, { _id: '1' }, { _id: '2' }]

  expect(callback(posts)).not.toContain(posts[0])
})

it('renders an error if the server fails to delete the post', async () => {
  server.use(
    http.delete('http://localhost/api/posts/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <>
      <Toast />
      <ProfilePostDeleteButton
        postType="default"
        postId="0"
        postName="test"
        setPosts={mockSetPosts}
      />
    </>
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')

  expect(mockSetPosts).not.toHaveBeenCalled()
})

it('renders an error if the server fails to delete the favorite post', async () => {
  server.use(
    http.put('http://localhost/api/user', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  const mockSetPosts = jest.fn()

  render(
    <>
      <Toast />
      <ProfilePostDeleteButton
        postType="favorite"
        postId="0"
        postName="test"
        setPosts={mockSetPosts}
      />
    </>
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')

  expect(mockSetPosts).not.toHaveBeenCalled()
})
