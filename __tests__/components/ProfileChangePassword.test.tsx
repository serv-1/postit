import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { SessionProvider } from 'next-auth/react'
import Toast from '../../components/Toast'
import ProfileChangePassword from '../../components/ProfileChangePassword'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'

const changeBtn = { name: /change/i }
const labelText = new RegExp('change your password', 'i')

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <ProfileChangePassword />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

const axiosPut = axios.put
afterEach(() => (axios.put = axiosPut))

describe('ProfileChangePassword', () => {
  describe('API call', () => {
    it('should render an error if the server did not respond', async () => {
      axios.put = jest.fn().mockRejectedValueOnce({ isAxiosError: true })
      factory()
      userEvent.type(screen.getByLabelText(labelText), 'new super password')
      userEvent.click(screen.getByRole('button', changeBtn))
      expect(await screen.findByRole('alert')).toHaveTextContent(
        err.NO_RESPONSE
      )
    })

    it('should render an error if the server failed to udpate the user', async () => {
      mockResponse('put', '/api/users/:id', 422, { message: err.PASSWORD_SAME })
      factory()
      userEvent.type(screen.getByLabelText(labelText), 'johndoe@test.com')
      userEvent.click(screen.getByRole('button', changeBtn))
      expect(await screen.findByRole('alert')).toHaveTextContent(
        err.PASSWORD_SAME
      )
    })
  })

  it('should update the user password', async () => {
    factory()
    userEvent.type(screen.getByLabelText(labelText), 'new super password')
    userEvent.click(screen.getByRole('button', changeBtn))
    expect(await screen.findByRole('alert')).toHaveClass('bg-success')
  })

  it('should not update the user password if it is too short', async () => {
    factory()
    userEvent.type(screen.getByLabelText(labelText), 'ah')
    userEvent.click(screen.getByRole('button', changeBtn))
    expect(await screen.findByRole('alert')).toHaveTextContent(err.PASSWORD_MIN)
  })

  it('should not update the user password if it is too long', async () => {
    factory()
    const tooLongPw = new Uint8Array(21).toString()
    userEvent.type(screen.getByLabelText(labelText), tooLongPw)
    userEvent.click(screen.getByRole('button', changeBtn))
    expect(await screen.findByRole('alert')).toHaveTextContent(err.PASSWORD_MAX)
  })

  it('should not update the user password if it is empty', async () => {
    factory()
    userEvent.click(screen.getByRole('button', changeBtn))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      err.PASSWORD_REQUIRED
    )
  })
})
