import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteAccountModal from '../../components/DeleteAccountModal'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const signOut = jest.spyOn(require('next-auth/react'), 'signOut')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeEach(() => {
  signOut.mockResolvedValue({ url: '/' })
  useToast.mockReturnValue({})
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
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

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
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
