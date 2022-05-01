import UpdateAccountForm from '../../components/UpdateAccountForm'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../../mocks/server'
import { rest } from 'msw'
import err from '../../utils/constants/errors'

const setToast = jest.fn()
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeEach(() => useToast.mockReturnValue({ setToast }))
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('an alert renders if the user name is updated', async () => {
  render(<UpdateAccountForm value="name" />)

  const input = screen.getByLabelText('Name')
  expect(input).toHaveAttribute('type', 'text')
  expect(input).toHaveAttribute('name', 'name')

  await userEvent.type(input, 'John Doe')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() =>
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: 'Your name has been updated! 🎉',
    })
  )
})

test('an alert renders if the user email is updated', async () => {
  render(<UpdateAccountForm value="email" />)

  const input = screen.getByLabelText('Email')
  expect(input).toHaveAttribute('type', 'email')
  expect(input).toHaveAttribute('name', 'email')

  await userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() =>
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: 'Your email has been updated! 🎉',
    })
  )
})

test('an alert renders if the user password is updated', async () => {
  render(<UpdateAccountForm value="password" />)

  const input = screen.getByLabelText('Password')
  expect(input).toHaveAttribute('type', 'password')
  expect(input).toHaveAttribute('name', 'password')

  await userEvent.type(input, 'super password')

  const submitBtn = screen.getByRole('button', { name: /change/i })
  await userEvent.click(submitBtn)

  await waitFor(() =>
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: 'Your password has been updated! 🎉',
    })
  )
})

test('an alert renders if the server fails to update the user name', async () => {
  server.use(
    rest.put('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.NAME_INVALID }))
    })
  )

  render(<UpdateAccountForm value="name" />)

  const input = screen.getByLabelText('Name')
  await userEvent.type(input, 'John Doe')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NAME_INVALID)
  expect(input).toHaveFocus()
})

test('an alert renders if the server fails to update the user password', async () => {
  server.use(
    rest.put('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.PASSWORD_INVALID }))
    })
  )

  render(<UpdateAccountForm value="password" />)

  const input = screen.getByLabelText('Password')
  await userEvent.type(input, 'super password')

  const submitBtn = screen.getByRole('button', { name: /change/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.PASSWORD_INVALID)
  expect(input).toHaveFocus()
})
