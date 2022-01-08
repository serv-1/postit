import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { SessionProvider } from 'next-auth/react'
import Toast from '../../components/Toast'
import UpdatePassword from '../../components/UpdatePassword'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <UpdatePassword />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

const axiosPut = axios.put
afterEach(() => (axios.put = axiosPut))

describe('UpdatePassword', () => {
  describe('API call', () => {
    it('should render an error if the server did not respond', async () => {
      axios.put = jest.fn().mockRejectedValueOnce({ isAxiosError: true })
      factory()
      userEvent.type(screen.getByLabelText(/password/i), 'new super password')
      userEvent.click(screen.getByRole('button'))
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NO_RESPONSE)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server failed to udpate the user', async () => {
      mockResponse('put', '/api/users/:id', 422, { message: err.PASSWORD_SAME })
      factory()
      userEvent.type(screen.getByLabelText(/password/i), 'johndoe@test.com')
      userEvent.click(screen.getByRole('button'))
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.PASSWORD_SAME)
      expect(toast).toHaveClass('bg-danger')
    })
  })

  it('should update the user password', async () => {
    factory()
    userEvent.type(screen.getByLabelText(/password/i), 'new super password')
    userEvent.click(screen.getByRole('button'))
    expect(await screen.findByRole('alert')).toHaveClass('bg-success')
  })

  it('should not update the user password if it is too short', async () => {
    factory()
    userEvent.type(screen.getByLabelText(/password/i), 'ah')
    userEvent.click(screen.getByRole('button'))
    const toast = await screen.findByRole('alert')
    expect(toast).toHaveTextContent(err.PASSWORD_MIN)
    expect(toast).toHaveClass('bg-danger')
  })

  it('should not update the user password if it is too long', async () => {
    factory()
    const tooLongPw = new Uint8Array(21).toString()
    userEvent.type(screen.getByLabelText(/password/i), tooLongPw)
    userEvent.click(screen.getByRole('button'))
    const toast = await screen.findByRole('alert')
    expect(toast).toHaveTextContent(err.PASSWORD_MAX)
    expect(toast).toHaveClass('bg-danger')
  })

  it('should not update the user password if it is empty', async () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    const toast = await screen.findByRole('alert')
    expect(toast).toHaveTextContent(err.PASSWORD_REQUIRED)
    expect(toast).toHaveClass('bg-danger')
  })
})
