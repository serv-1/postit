import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileDeleteAccount from '../../components/ProfileDeleteAccount'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const signOut = jest.spyOn(require('next-auth/react'), 'signOut')

beforeEach(() => signOut.mockResolvedValue({ url: '/' }))

test('the user is signed out and redirected to the home page after being deleted', async () => {
  render(
    <ToastProvider>
      <ProfileDeleteAccount id={mockSession.id} />
      <Toast />
    </ToastProvider>
  )

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /^delete$/i })
  userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' })
  })
})

test('the cancel button closes the modal', () => {
  render(
    <ToastProvider>
      <ProfileDeleteAccount id={mockSession.id} />
      <Toast />
    </ToastProvider>
  )

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const closeModalBtn = screen.getByRole('button', { name: /close/i })
  userEvent.click(closeModalBtn)

  const deleteBtn = screen.queryByRole('button', { name: /^delete$/i })
  expect(deleteBtn).not.toBeInTheDocument()
})

test('an error renders if the server fails to delete the user', async () => {
  server.use(
    rest.delete('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.PARAMS_INVALID }))
    })
  )

  render(
    <ToastProvider>
      <ProfileDeleteAccount id={mockSession.id} />
      <Toast />
    </ToastProvider>
  )

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /^delete$/i })
  userEvent.click(deleteBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.PARAMS_INVALID)
  expect(toast).toHaveClass('bg-danger')
})
