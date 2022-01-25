import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionProvider } from 'next-auth/react'
import ProfileDeleteAccount from '../../components/ProfileDeleteAccount'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/constants/errors'
import { mockResponse } from '../../lib/msw'

const signOut = jest.spyOn(require('next-auth/react'), 'signOut')
signOut.mockResolvedValue({ url: '/' })

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <ProfileDeleteAccount />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

test('the user is signed out and redirected to the home page after being deleted', async () => {
  factory()

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
  factory()

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const closeModalBtn = screen.getByRole('button', { name: /close/i })
  userEvent.click(closeModalBtn)

  const deleteBtn = screen.queryByRole('button', { name: /^delete$/i })
  expect(deleteBtn).not.toBeInTheDocument()
})

test('an error renders if the server fails the delete the user', async () => {
  mockResponse('delete', '/api/users/:id', 422, { message: err.PARAMS_INVALID })

  factory()

  const openModalBtn = screen.getByRole('button')
  userEvent.click(openModalBtn)

  const deleteBtn = screen.getByRole('button', { name: /^delete$/i })
  userEvent.click(deleteBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.PARAMS_INVALID)
  expect(toast).toHaveClass('bg-danger')
})
