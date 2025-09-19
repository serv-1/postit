import { render, screen } from '@testing-library/react'
import UpdateUserPasswordForm from '.'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import Toast from 'components/Toast'
import userEvent from '@testing-library/user-event'

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders a message if the user password has been updated', async () => {
  server.use(
    http.put('http://localhost/api/user', async ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({ password: '0123456789' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserPasswordForm />
    </>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitBtn = screen.getByRole('button', { name: 'Change' })

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('Your password has been updated! 🎉')
})

it('renders an error if it fails to update the user password', async () => {
  server.use(
    http.put('http://localhost/api/user', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserPasswordForm />
    </>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitBtn = screen.getByRole('button', { name: 'Change' })

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('gives the focus to the password input if it fails to update the user password', async () => {
  server.use(
    http.put('http://localhost/api/user', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(<UpdateUserPasswordForm />)

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitBtn = screen.getByRole('button', { name: 'Change' })

  await userEvent.click(submitBtn)

  expect(passwordInput).toHaveFocus()
})
