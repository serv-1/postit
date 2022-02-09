import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../../components/Toast'
import ProfileChangePassword from '../../components/ProfileChangePassword'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const labelText = new RegExp('change your password', 'i')

const factory = () => {
  render(
    <ToastProvider>
      <ProfileChangePassword id={mockSession.id} />
      <Toast />
    </ToastProvider>
  )
}

test('an alert renders if the user password is updated', async () => {
  factory()

  await screen.findByTestId('csrfToken')

  const input = screen.getByLabelText(labelText)
  userEvent.type(input, 'my new password')

  const submitBtn = screen.getByRole('button', { name: /change/i })
  userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveClass('bg-success')
})

test('an error renders if the server fails to update the user', async () => {
  server.use(
    rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.PASSWORD_MIN }))
    })
  )

  factory()

  await screen.findByTestId('csrfToken')

  const input = screen.getByLabelText(labelText)
  userEvent.type(input, 'pw')

  const submitBtn = screen.getByRole('button', { name: /change/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.PASSWORD_MIN)

  await waitFor(() => expect(input).toHaveFocus())
})
