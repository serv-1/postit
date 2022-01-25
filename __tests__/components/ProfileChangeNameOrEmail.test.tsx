import ProfileChangeNameOrEmail from '../../components/ProfileChangeNameOrEmail'
import { SessionProvider } from 'next-auth/react'
import { mockSession } from '../../mocks/nextAuth'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import { mockResponse } from '../../lib/msw'
import { ToastProvider } from '../../contexts/toast'
import Toast from '../../components/Toast'

const username = mockSession.user.name

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

test('the user name/email, the edit button and the form renders correctly', async () => {
  factory()

  const name = screen.getByText(username)
  expect(name).toBeInTheDocument()

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  const form = screen.getByRole('form')
  expect(form).toBeInTheDocument()

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  expect(input).toHaveValue(username)
  expect(input).toHaveFocus()
})

test('the cancel button renders the user name/email before being edited with the edit button', async () => {
  factory()

  let editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.type(input, ' edited')

  const cancelBtn = screen.getByRole('button', { name: /cancel/i })
  userEvent.click(cancelBtn)

  const name = screen.getByText(username)
  expect(name).toBeInTheDocument()

  editBtn = screen.getByRole('button', { name: /edit/i })
  expect(editBtn).toBeInTheDocument()

  const form = screen.queryByRole('form')
  expect(form).not.toBeInTheDocument()
})

test('the form updates the user name/email and renders it with the edit button and a successful message', async () => {
  factory()

  let editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.type(input, ' edited')

  const submitBtn = screen.getByRole('button', { name: /submit/i })
  userEvent.click(submitBtn)

  const name = await screen.findByText(username + ' edited')
  expect(name).toBeInTheDocument()

  editBtn = screen.getByRole('button', { name: /edit/i })
  expect(editBtn).toBeInTheDocument()

  const toast = screen.getByRole('alert')
  expect(toast).toHaveClass('bg-success')

  const form = screen.queryByRole('form')
  expect(form).not.toBeInTheDocument()
})

test('the form does not update the user name/email if it has not change', async () => {
  factory()

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.clear(input)
  userEvent.type(input, username)

  const submitBtn = screen.getByRole('button', { name: /submit/i })
  userEvent.click(submitBtn)

  await screen.findByText(username)

  const toast = screen.queryByRole('alert')
  expect(toast).not.toBeInTheDocument()
})

test('an error renders if the server failed to update the user', async () => {
  mockResponse('put', '/api/users/:id', 422, { message: err.NAME_MAX })

  factory()

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.type(input, ' edited')

  const submitBtn = screen.getByRole('button', { name: /submit/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NAME_MAX)

  await waitFor(() => expect(input).toHaveFocus())
})
