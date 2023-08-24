import AuthenticationRegisterForm from '.'
import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from 'utils/constants/errors'
import server from 'mocks/server'
import { rest } from 'msw'
import { useToast } from 'contexts/toast'

const mockRouterPush = jest.fn()

jest
  .mock('contexts/toast', () => ({
    useToast: jest.fn(),
  }))
  .mock('next/navigation', () => ({
    useRouter: () => ({ push: mockRouterPush }),
  }))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>
const signIn = jest.spyOn(require('next-auth/react'), 'signIn')

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  signIn.mockResolvedValue({ error: '' })
  useToastMock.mockReturnValue({ toast: {}, setToast() {} })
})

it('registers the user and signs in him and redirects him to its profile', async () => {
  render(<AuthenticationRegisterForm />)

  const nameInput = screen.getByLabelText(/name/i)
  expect(nameInput).toHaveFocus()
  await userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/profile')
  })
})

it('an alert renders if the server fails to sign in the user', async () => {
  const setToast = jest.fn()
  useToastMock.mockReturnValue({ setToast, toast: {} })
  signIn.mockResolvedValue({ error: 'Error' })

  render(<AuthenticationRegisterForm />)

  const nameInput = screen.getByLabelText(/name/i)
  expect(nameInput).toHaveFocus()
  await userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  await userEvent.click(submitBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))
})

test('an error renders if the server fails to register the user', async () => {
  const setToast = jest.fn()
  useToastMock.mockReturnValue({ setToast, toast: {} })

  server.use(
    rest.post('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(405), ctx.json({ message: err.METHOD_NOT_ALLOWED }))
    })
  )

  render(<AuthenticationRegisterForm />)

  const nameInput = screen.getByLabelText(/name/i)
  await userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.METHOD_NOT_ALLOWED, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to validate the request data', async () => {
  server.use(
    rest.post('http://localhost/api/user', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'name', message: err.NAME_REQUIRED })
      )
    })
  )

  render(<AuthenticationRegisterForm />)

  const nameInput = screen.getByLabelText(/name/i)
  await userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NAME_REQUIRED)
})
