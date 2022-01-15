import ProfileChangeNameOrEmail from '../../components/ProfileChangeNameOrEmail'
import axios from 'axios'
import { SessionProvider } from 'next-auth/react'
import { mockSession } from '../../mocks/nextAuth'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'
import { ToastProvider } from '../../contexts/toast'
import Toast from '../../components/Toast'

const username = mockSession.user.name
const submitBtn = { name: /submit/i }
const cancelBtn = { name: /cancel/i }
const editBtn = { name: /edit/i }

const factory = (subject: 'name' | 'email' = 'name') => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <ProfileChangeNameOrEmail subject={subject} />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

const axiosPut = axios.put
afterEach(() => (axios.put = axiosPut))

describe('ProfileChangeNameOrEmail', () => {
  describe('API call', () => {
    it('should render an error if the server did not respond while updating the user', async () => {
      axios.put = jest.fn().mockRejectedValueOnce({ isAxiosError: true })
      factory()
      userEvent.click(screen.getByRole('button', editBtn))
      userEvent.type(screen.getByRole('textbox'), 'edited')
      userEvent.click(screen.getByRole('button', submitBtn))
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NO_RESPONSE)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server failed to udpate the user', async () => {
      mockResponse('put', '/api/users/:id', 422, { message: err.NAME_MAX })
      factory()
      userEvent.click(screen.getByRole('button', editBtn))
      userEvent.type(await screen.findByRole('textbox'), 'edited')
      userEvent.click(screen.getByRole('button', submitBtn))
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NAME_MAX)
      expect(toast).toHaveClass('bg-danger')
    })
  })

  describe('Form', () => {
    it('should render the user subject', () => {
      factory()
      expect(screen.getByText(username)).toBeInTheDocument()
    })

    it('should update the user subject and render a successful message', async () => {
      factory()
      userEvent.click(screen.getByRole('button', editBtn))
      userEvent.type(screen.getByRole('textbox'), 'edited')
      userEvent.click(screen.getByRole('button', submitBtn))
      expect(await screen.findByText(username + 'edited')).toBeInTheDocument()
      expect(await screen.findByRole('alert')).toHaveClass('bg-success')
    })

    it('should not update the user subject if it has not change', async () => {
      factory()
      userEvent.click(screen.getByRole('button', editBtn))
      userEvent.click(screen.getByRole('button', submitBtn))
      await screen.findByText(username)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    describe('input', () => {
      it('should not be rendered initially', () => {
        factory()
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })

      it('should have the user subject to default value', () => {
        factory()
        userEvent.click(screen.getByRole('button', editBtn))
        expect(screen.getByRole('textbox')).toHaveValue(username)
      })

      it('should have the focus', () => {
        factory()
        userEvent.click(screen.getByRole('button', editBtn))
        expect(screen.getByRole('textbox')).toHaveFocus()
      })
    })

    describe('submit button', () => {
      it('should not be rendered initially', () => {
        factory()
        expect(screen.queryByRole('button', submitBtn)).not.toBeInTheDocument()
      })
    })

    describe('edit button', () => {
      it('should render the input and the submit btn and remove the user subject on click', async () => {
        factory()
        userEvent.click(screen.getByRole('button', editBtn))
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('button', submitBtn)).toBeInTheDocument()
        expect(screen.queryByText(username)).not.toBeInTheDocument()
      })
    })

    describe('cancel button', () => {
      it('should render the user subject and the edit btn and remove the input and the submit btn on click', async () => {
        factory()
        userEvent.click(screen.getByRole('button', editBtn))
        userEvent.click(screen.getByRole('button', cancelBtn))
        expect(screen.getByText(username)).toBeInTheDocument()
        expect(screen.getByRole('button', editBtn)).toBeInTheDocument()
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', submitBtn)).not.toBeInTheDocument()
      })

      it('should not update the user subject on click', () => {
        factory()
        userEvent.click(screen.getByRole('button', editBtn))
        userEvent.type(screen.getByRole('textbox'), 'edited')
        userEvent.click(screen.getByRole('button', cancelBtn))
        expect(screen.queryByText(username + 'edited')).not.toBeInTheDocument()
      })
    })
  })
})
