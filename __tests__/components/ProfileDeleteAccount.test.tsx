import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileDeleteAccount from '../../components/ProfileDeleteAccount'
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
  render(<ProfileDeleteAccount />)

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /^delete$/i })
  userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(signOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
  })
})

test('the cancel button closes the modal', () => {
  render(<ProfileDeleteAccount />)

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const cancelBtn = screen.getByRole('button', { name: /cancel/i })
  userEvent.click(cancelBtn)

  const deleteBtn = screen.queryByRole('button', { name: /^delete$/i })
  expect(deleteBtn).not.toBeInTheDocument()
})

test('an error renders if the server fails to delete the user', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.delete('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.PARAMS_INVALID }))
    })
  )

  render(<ProfileDeleteAccount />)

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /^delete$/i })
  userEvent.click(deleteBtn)

  await waitFor(() => {
    const toast = { message: err.PARAMS_INVALID, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
