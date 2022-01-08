import UpdateNameOrEmail from '../../components/UpdateNameOrEmail'
import axios from 'axios'
import { SessionProvider } from 'next-auth/react'
import { mockSession } from '../../mocks/nextAuth'
import { ToastProvider } from '../../contexts/toast'
import Toast from '../../components/Toast'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'

const name = mockSession.user.name
const email = mockSession.user.email
const emailRegex = new RegExp(email, 'i')

const factory = (subject: 'name' | 'email' = 'name') => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <UpdateNameOrEmail subject={subject} />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

const axiosPut = axios.put
afterEach(() => (axios.put = axiosPut))

describe('UpdateNameOrEmail', () => {
  describe('API call', () => {
    it('should render an error if the server did not respond while updating the user', async () => {
      axios.put = jest.fn().mockRejectedValueOnce({ isAxiosError: true })
      factory()
      userEvent.click(screen.getByText(name))
      userEvent.type(await screen.findByRole('textbox'), 'edited{Enter}')
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NO_RESPONSE)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server failed to udpate the user', async () => {
      mockResponse('put', '/api/users/:id', 422, { message: err.NAME_MAX })
      factory()
      userEvent.click(screen.getByText(name))
      userEvent.type(await screen.findByRole('textbox'), 'edited{Enter}')
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NAME_MAX)
      expect(toast).toHaveClass('bg-danger')
    })
  })

  describe('text', () => {
    it('should render the name', () => {
      factory()
      expect(screen.getByText(name)).toBeInTheDocument()
    })

    it('should render the email', () => {
      factory('email')
      expect(screen.getByText(emailRegex)).toBeInTheDocument()
    })

    it('should render the input on click', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      expect(await screen.findByRole('textbox')).toBeInTheDocument()
    })

    it('should be focusable', async () => {
      factory()
      screen.getByText(name).focus()
      expect(await screen.findByText(name)).toHaveFocus()
    })

    it('should render the input by pressing "Enter"', async () => {
      factory()
      screen.getByText(name).focus()
      userEvent.keyboard('{Enter}')
      expect(await screen.findByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('input', () => {
    it('should be focused', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      expect(await screen.findByRole('textbox')).toHaveFocus()
    })

    it('should have the user name or the user email to default value', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      expect(await screen.findByRole('textbox')).toHaveValue(name)
    })

    it('shoud be of type "text" if the subject is the user name', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      expect(await screen.findByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('should be of type "email" if the subject is the user email', async () => {
      factory('email')
      userEvent.click(screen.getByText(emailRegex))
      expect(await screen.findByRole('textbox')).toHaveAttribute(
        'type',
        'email'
      )
    })

    it('should update the user name or user email on blur', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      userEvent.type(screen.getByRole('textbox'), 'edited')
      userEvent.tab()
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveClass('bg-success')
      expect(await screen.findByText(name + 'edited')).toBeInTheDocument()
    })

    it('should update the user name or user email by pressing "Enter"', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      userEvent.type(screen.getByRole('textbox'), 'edited{Enter}')
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveClass('bg-success')
      expect(await screen.findByText(name + 'edited')).toBeInTheDocument()
    })

    it('should not update the user name or user email if it has not change', async () => {
      factory()
      userEvent.click(screen.getByText(name))
      userEvent.tab()
      expect(await screen.findByText(name)).toBeInTheDocument()
    })
  })
})
