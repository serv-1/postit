import UpdateAccountForm from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import { NAME_INVALID, EMAIL_INVALID, PASSWORD_INVALID } from 'constants/errors'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const server = setupServer()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders an alert if the user name is updated', async () => {
  const name = 'John Doe'

  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get('x-csrf-token')).toBe('token')
      expect(await req.json()).toEqual({ name })

      return res(ctx.status(204))
    })
  )

  const setName = jest.fn()

  render(<UpdateAccountForm value="name" setName={setName} />)

  const input = screen.getByLabelText('Name')

  expect(input).toHaveAttribute('type', 'text')
  expect(input).toHaveAttribute('name', 'name')

  await userEvent.type(input, name)

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(setName).toHaveBeenNthCalledWith(1, name)
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'Your name has been updated! 🎉',
    })
  })
})

it('renders an alert if the user email is updated', async () => {
  const email = 'johndoe@test.com'

  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get('x-csrf-token')).toBe('token')
      expect(await req.json()).toEqual({ email })

      return res(ctx.status(204))
    })
  )

  const setName = jest.fn()

  render(<UpdateAccountForm value="email" setName={setName} />)

  const input = screen.getByLabelText('Email')

  expect(input).toHaveAttribute('type', 'email')
  expect(input).toHaveAttribute('name', 'email')

  await userEvent.type(input, email)

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(setName).toHaveBeenNthCalledWith(1, email)
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'Your email has been updated! 🎉',
    })
  })
})

it('renders an alert if the user password is updated', async () => {
  const password = 'super password'

  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get('x-csrf-token')).toBe('token')
      expect(await req.json()).toEqual({ password })

      return res(ctx.status(204))
    })
  )

  const setName = jest.fn()

  render(<UpdateAccountForm value="password" setName={setName} />)

  const input = screen.getByLabelText('Password')

  expect(input).toHaveAttribute('type', 'password')
  expect(input).toHaveAttribute('name', 'password')

  await userEvent.type(input, password)

  const submitBtn = screen.getByRole('button', { name: /change/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(setName).toHaveBeenNthCalledWith(1, password)
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'Your password has been updated! 🎉',
    })
  })
})

it('renders an error if the server fails to update the user name', async () => {
  server.use(
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: NAME_INVALID }))
    })
  )

  render(<UpdateAccountForm value="name" />)

  const input = screen.getByLabelText('Name')

  await userEvent.type(input, 'John Doe')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent(NAME_INVALID)
  expect(input).toHaveFocus()
})

it('renders an error if the server fails to update the user email', async () => {
  server.use(
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: EMAIL_INVALID }))
    })
  )

  render(<UpdateAccountForm value="email" />)

  const input = screen.getByLabelText('Email')

  await userEvent.type(input, 'john@test.com')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent(EMAIL_INVALID)
  expect(input).toHaveFocus()
})

it('renders an error if the server fails to update the user password', async () => {
  server.use(
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: PASSWORD_INVALID }))
    })
  )

  render(<UpdateAccountForm value="password" />)

  const input = screen.getByLabelText('Password')

  await userEvent.type(input, 'super password')

  const submitBtn = screen.getByRole('button', { name: /change/i })

  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent(PASSWORD_INVALID)
  expect(input).toHaveFocus()
})
