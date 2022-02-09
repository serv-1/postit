import ForgotPassword from '../../pages/auth/forgot-password'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')

beforeEach(() => signIn.mockResolvedValue({ error: '' }))

test("the form sends a mail for the user to sign in which redirect him to it's profile", async () => {
  render(<ForgotPassword />)

  const input = screen.getByRole('textbox')
  userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(signIn).toHaveBeenNthCalledWith(1, 'email', {
      email: 'johndoe@test.com',
      callbackUrl: 'http://localhost:3000/profile',
    })
  })
})

test('an error renders if the server fails to verify the user email', async () => {
  server.use(
    rest.post('http://localhost:3000/api/verifyEmail', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.EMAIL_INVALID }))
    })
  )

  render(<ForgotPassword />)

  const input = screen.getByRole('textbox')
  userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.EMAIL_INVALID)

  await waitFor(() => expect(input).toHaveFocus())
})
