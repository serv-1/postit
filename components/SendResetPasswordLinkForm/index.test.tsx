import SendResetPasswordLinkForm from '.'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the given email as the email input's default value", () => {
  render(<SendResetPasswordLinkForm email="testing@test.com" />)

  const emailInput = screen.getByRole('textbox')

  expect(emailInput).toHaveValue('testing@test.com')
})

it("doesn't render the error message if there is no error", () => {
  render(<SendResetPasswordLinkForm />)

  const message = screen.queryByRole('alert')

  expect(message).not.toBeInTheDocument()
})

it('renders the success message if the server successfully sends the email', async () => {
  server.use(
    http.post('http://localhost/api/send-email', async ({ request }) => {
      expect(await request.json()).toEqual({ email: 'testing@test.com' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(<SendResetPasswordLinkForm email="testing@test.com" />)

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const message = screen.getByRole('alert')

  expect(message).toHaveTextContent('Email successfully sent!')
})

it('renders the error message if the server fails to send the email', async () => {
  server.use(
    http.post('http://localhost/api/send-email', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(<SendResetPasswordLinkForm email="testing@test.com" />)

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const message = screen.getByRole('alert')

  expect(message).toHaveTextContent('error')
})
