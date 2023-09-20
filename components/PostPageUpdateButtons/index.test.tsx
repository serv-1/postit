import PostPageUpdateButtons from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import 'cross-fetch/polyfill'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const mockPush = jest.fn()
const server = setupServer()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
  }))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders as simple buttons', () => {
  render(<PostPageUpdateButtons id="0" name="table" />)

  const link = screen.getByRole('link')

  expect(link).toHaveAttribute('href', '/posts/0/table/update')

  const editBtn = screen.getByRole('button', { name: /edit/i })

  expect(editBtn).toBeInTheDocument()

  const deleteBtn = screen.getByRole('button', { name: /delete/i })

  expect(deleteBtn).toBeInTheDocument()
})

it('renders as dot buttons', () => {
  render(<PostPageUpdateButtons id="0" name="table" isDotButton />)

  const editDotBtn = screen.getByLabelText(/edit/i)

  expect(editDotBtn).toBeInTheDocument()

  const deleteDotBtn = screen.getByLabelText(/delete/i)

  expect(deleteDotBtn).toBeInTheDocument()
})

it('redirects the user to its profile if the post has been deleted', async () => {
  server.use(
    rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  const { rerender } = render(<PostPageUpdateButtons id="0" name="table" />)

  let deleteBtn = screen.getByRole('button', { name: /delete/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => expect(mockPush).toHaveBeenNthCalledWith(1, '/profile'))

  rerender(<PostPageUpdateButtons id="0" name="table" isDotButton />)

  deleteBtn = screen.getByRole('button', { name: /delete/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => expect(mockPush).toHaveBeenNthCalledWith(1, '/profile'))
})

it('renders an error if the server fails to delete the post', async () => {
  server.use(
    rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<PostPageUpdateButtons id="0" name="table" />)

  const deleteBtn = screen.getByRole('button', { name: /delete/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})
