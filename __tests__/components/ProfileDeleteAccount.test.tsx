import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { SessionProvider } from 'next-auth/react'
import ProfileDeleteAccount from '../../components/ProfileDeleteAccount'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'

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

const axiosDelete = axios.delete

beforeEach(() => (axios.delete = axiosDelete))

describe('ProfileDeleteAccount', () => {
  describe('API call', () => {
    it('should render an error if the server did not respond', async () => {
      axios.delete = jest.fn().mockRejectedValueOnce({})
      factory()
      userEvent.click(screen.getByRole('button'))
      userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NO_RESPONSE)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server failed to update the user', async () => {
      mockResponse('delete', '/api/users/:id', 422, {
        message: err.PARAMS_INVALID,
      })
      factory()
      userEvent.click(screen.getByRole('button'))
      userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.PARAMS_INVALID)
      expect(toast).toHaveClass('bg-danger')
    })
  })

  describe('Modal', () => {
    it('should be closed if the cancel button is clicked', () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      const cancelBtn = screen.getByRole('button', { name: /cancel/i })
      userEvent.click(cancelBtn)
      expect(cancelBtn).not.toBeInTheDocument()
    })

    it('should delete the user account if the delete button is clicked', async () => {
      const signOut = jest.spyOn(require('next-auth/react'), 'signOut')
      const useRouter = jest.spyOn(require('next/router'), 'useRouter')
      const router = { push: jest.fn() }
      signOut.mockResolvedValue({ url: '/' })
      useRouter.mockReturnValue(router)
      factory()
      userEvent.click(screen.getByRole('button'))
      userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/')
        expect(router.push).toHaveBeenCalledTimes(1)
      })
    })
  })
})
