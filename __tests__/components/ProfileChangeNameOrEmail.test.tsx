import ProfileChangeNameOrEmail from '../../components/ProfileChangeNameOrEmail'
import { mockSession } from '../../mocks/nextAuth'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import { ToastProvider } from '../../contexts/toast'
import Toast from '../../components/Toast'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const factory = (type: 'name' | 'email', value?: string) => {
  render(
    <ToastProvider>
      <ProfileChangeNameOrEmail type={type} id={mockSession.id} value={value} />
      <Toast />
    </ToastProvider>
  )
}

test('the user name/email and the form renders correctly', async () => {
  factory('name', 'John Doe')

  const name = screen.getByText('John Doe')
  expect(name).toBeInTheDocument()

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  const form = screen.getByRole('form')
  expect(form).toBeInTheDocument()

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('type', 'text')
  expect(input).toHaveValue('John Doe')
  expect(input).toHaveFocus()
})

test('an input with an email type renders', async () => {
  factory('email')

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const emailInput = screen.getByRole('textbox')
  expect(emailInput).toHaveAttribute('type', 'email')
})

test('the cancel button cancels the editing process', async () => {
  factory('name', 'John Doe')

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.type(input, ' edited')

  const cancelBtn = screen.getByRole('button', { name: /cancel/i })
  userEvent.click(cancelBtn)

  const name = screen.getByText('John Doe')
  expect(name).toBeInTheDocument()
})

test('an alert renders if the user name/email is updated and the new user name/email renders', async () => {
  factory('name', 'John Doe')

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.type(input, ' edited')

  const submitBtn = screen.getByRole('button', { name: /submit/i })
  userEvent.click(submitBtn)

  const name = await screen.findByText('John Doe' + ' edited')
  expect(name).toBeInTheDocument()

  const toast = screen.getByRole('alert')
  expect(toast).toHaveClass('bg-success')
})

test('the user name/email does not update if it has not change', async () => {
  factory('name', 'John Doe')

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const input = screen.getByRole('textbox')
  userEvent.clear(input)
  userEvent.type(input, 'John Doe')

  const submitBtn = screen.getByRole('button', { name: /submit/i })
  userEvent.click(submitBtn)

  await screen.findByText('John Doe')

  const toast = screen.queryByRole('alert')
  expect(toast).not.toBeInTheDocument()
})

test('an error renders if the server fails to update the user', async () => {
  server.use(
    rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.NAME_MAX }))
    })
  )

  factory('name', 'John Doe')

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
