import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteAccountModal from '.'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import 'cross-fetch/polyfill'
import Toast from 'components/Toast'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSignOut = jest.spyOn(require('next-auth/react'), 'signOut')
const server = setupServer()

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('signs the user out and redirects him to the home page after being deleted', async () => {
  server.use(
    rest.delete('http://localhost/api/user', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return res(ctx.status(204))
    })
  )

  render(<DeleteAccountModal />)

  const openModalBtn = screen.getByRole('button')

  await userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /delete$/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(mockSignOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
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
    rest.delete('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
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
