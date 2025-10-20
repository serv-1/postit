import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteAccountModal from '.'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import Toast from 'components/Toast'
// @ts-expect-error
import { mockSignOut, mockGetCsrfToken } from 'next-auth/react'

jest.mock('next-auth/react')

const server = setupServer()

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('signs the user out and redirects him to the home page after being deleted', async () => {
  server.use(
    http.delete('http://localhost/api/user', ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(<DeleteAccountModal />)

  const openModalBtn = screen.getByRole('button')

  await userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /delete$/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(mockSignOut).toHaveBeenNthCalledWith(1, { redirectTo: '/' })
  })
})

it('opens/closes', async () => {
  render(<DeleteAccountModal />)

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(modal).not.toBeInTheDocument()

  await userEvent.click(openBtn)

  const cancelBtn = screen.getByRole('button', { name: /cancel/i })

  await userEvent.click(cancelBtn)

  expect(cancelBtn).not.toBeInTheDocument()
})

it('renders an error if the server fails to delete the user', async () => {
  server.use(
    http.delete('http://localhost/api/user', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <DeleteAccountModal />
      <Toast />
    </>
  )

  const openModalBtn = screen.getByRole('button')

  await userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /delete$/i })

  await userEvent.click(deleteBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})
