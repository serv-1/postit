import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionProvider } from 'next-auth/react'
import DeleteUser from '../../components/DeleteUser'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'
import axios from 'axios'

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <DeleteUser />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

const axiosDelete = axios.delete

beforeEach(() => (axios.delete = axiosDelete))

describe('DeleteUser', () => {
  describe('button', () => {
    it('should render the modal on click', async () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByTestId('modal')).toBeInTheDocument()
    })
  })

  describe('modal', () => {
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

    it('should be closed if the close button is clicked', () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      userEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should be closed if the cancel button is clicked', () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      userEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should delete the user if the delete button is clicked', async () => {
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
