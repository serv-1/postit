import Register from '../../pages/register'
import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import { ToastProvider } from '../../contexts/toast'
import Toast from '../../components/Toast'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }

beforeEach(() => {
  signIn.mockResolvedValue({ error: '' })
  useRouter.mockReturnValue(router)
})

const factory = () => {
  render(
    <ToastProvider>
      <Register />
      <Toast />
    </ToastProvider>
  )
}

test("the form registers the user, sends him a mail, signs in him and redirects him to it's profile", async () => {
  factory()

  const nameInput = screen.getByLabelText(/name/i)
  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(signIn).toHaveBeenCalledWith('email', {
      email: 'johndoe@test.com',
      callbackUrl: 'http://localhost:3000/profile',
      redirect: false,
    })

    expect(router.push).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith('/profile')
  })
})

test('the forms redirects the user to the sign in page if it fails to do it', async () => {
  signIn.mockResolvedValue({ error: 'Error' })

  factory()

  const nameInput = screen.getByLabelText(/name/i)
  expect(nameInput).toHaveFocus()
  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith('/auth/sign-in')
  })
})

test('an error renders if the server fails to register the user', async () => {
  server.use(
    rest.post('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(ctx.status(405), ctx.json({ message: err.METHOD_NOT_ALLOWED }))
    })
  )

  factory()

  const nameInput = screen.getByLabelText(/name/i)
  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.METHOD_NOT_ALLOWED)
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to validate the request data', async () => {
  server.use(
    rest.post('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'name', message: err.NAME_REQUIRED })
      )
    })
  )

  factory()

  const nameInput = screen.getByLabelText(/name/i)
  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NAME_REQUIRED)
  expect(alert).not.toHaveClass('bg-danger')
})
