import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteAccountModal from '.'
import err from 'utils/constants/errors'
import server from 'mocks/server'
import { rest } from 'msw'

const mockSetToast = jest.fn()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

const signOut = jest.spyOn(require('next-auth/react'), 'signOut')

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  signOut.mockResolvedValue({ url: '/' })
})

test('the user is signed out and redirected to the home page after being deleted', async () => {
  render(<DeleteAccountModal />)

  const openModalBtn = screen.getByRole('button')
  await userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /delete$/i })
  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(signOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
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

test('an error renders if the server fails to delete the user', async () => {
  server.use(
    rest.delete('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.PARAMS_INVALID }))
    })
  )

  render(<DeleteAccountModal />)

  const openModalBtn = screen.getByRole('button')
  await userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /delete$/i })
  await userEvent.click(deleteBtn)

  await waitFor(() => {
    const toast = { message: err.PARAMS_INVALID, error: true }
    expect(mockSetToast).toHaveBeenNthCalledWith(1, toast)
  })
})
