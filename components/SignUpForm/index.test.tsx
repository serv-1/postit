import SignUpForm from '.'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import Toast from 'components/Toast'

const mockRouterPush = jest.fn()
const mockSignIn = jest.spyOn(require('next-auth/react'), 'signIn')
const server = setupServer()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

beforeEach(() => {
  mockSignIn.mockResolvedValue({ error: '' })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('registers the user, signs him in and redirects him to its profile', async () => {
  server.use(
    rest.post('http://localhost/api/user', async (req, res, ctx) => {
      expect(await req.json()).toEqual({
        name: 'john',
        email: 'john@test.com',
        password: 'my super password',
      })

      return res(
        ctx.status(201),
        ctx.json({ id: '0' }),
        ctx.set('Location', '/profile')
      )
    })
  )

  render(<SignUpForm />)

  const nameInput = screen.getByLabelText(/name/i)

  expect(nameInput).toHaveFocus()

  await userEvent.type(nameInput, 'john')

  const emailInput = screen.getByLabelText(/email/i)

  await userEvent.type(emailInput, 'john@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })

  await userEvent.click(submitBtn)

  expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/profile')
})

it('renders an alert if the server fails to sign the user in', async () => {
  server.use(
    rest.post('http://localhost/api/user', async (req, res, ctx) => {
      expect(await req.json()).toEqual({
        name: 'john',
        email: 'john@test.com',
        password: 'my super password',
      })

      return res(
        ctx.status(201),
        ctx.json({ id: '0' }),
        ctx.set('Location', '/profile')
      )
    })
  )

  mockSignIn.mockResolvedValue({ error: 'Error' })

  render(
    <>
      <Toast />
      <SignUpForm />
    </>
  )

  const nameInput = screen.getByLabelText(/name/i)

  expect(nameInput).toHaveFocus()

  await userEvent.type(nameInput, 'john')

  const emailInput = screen.getByLabelText(/email/i)

  await userEvent.type(emailInput, 'john@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'Your account has been successfully created. You can now sign in!'
  )
})

it('renders an error if the server fails to register the user', async () => {
  server.use(
    rest.post('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <>
      <Toast />
      <SignUpForm />
    </>
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'john')

  const emailInput = screen.getByLabelText(/email/i)

  await userEvent.type(emailInput, 'john@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('renders an error if the server fails to validate the request data', async () => {
  server.use(
    rest.post('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(<SignUpForm />)

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'john')

  const emailInput = screen.getByLabelText(/email/i)

  await userEvent.type(emailInput, 'john@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })

  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent('error')
})
