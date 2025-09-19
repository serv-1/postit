import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeletePostButton from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import Toast from 'components/Toast'

const mockPush = jest.fn()
const server = setupServer()

jest
  .mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
  }))
  .mock('next-auth/react', () => ({
    getCsrfToken: async () => 'token',
  }))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders a danger button', () => {
  render(<DeletePostButton postId="0" />)

  const btn = screen.getByRole('button')

  expect(btn).toHaveClass('danger-btn')
  expect(btn).toHaveTextContent(/delete/i)
})

it('renders a round button', () => {
  render(<DeletePostButton postId="0" isRound />)

  const btn = screen.getByRole('button')

  expect(btn).toHaveClass('round-btn')
  expect(btn).not.toHaveTextContent(/delete/i)
})

it('deletes the post and redirects the user to its profile page', async () => {
  server.use(
    http.delete('http://localhost/api/posts/:id', ({ request, params }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(params.id).toBe('0')

      return new HttpResponse(null, { status: 201 })
    })
  )

  render(<DeletePostButton postId="0" />)

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockPush).toHaveBeenNthCalledWith(1, '/profile')
})

it('renders an error if the server fails to delete the post', async () => {
  server.use(
    http.delete('http://localhost/api/posts/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <DeletePostButton postId="0" />
      <Toast />
    </>
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
  expect(mockPush).not.toHaveBeenCalled()
})
