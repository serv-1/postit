import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockResponse } from '../../lib/msw'
import { mockSession } from '../../mocks/nextAuth'
import Profile from '../../pages/profile'
import err from '../../utils/constants/errors'

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <Profile />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

test('an error renders if the server fails to get the user', async () => {
  mockResponse('get', '/api/users/:id', 404, { message: err.USER_NOT_FOUND })

  factory()

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.USER_NOT_FOUND)
  expect(toast).toHaveClass('bg-danger')
})
