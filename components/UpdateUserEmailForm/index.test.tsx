import { render, screen } from '@testing-library/react'
import UpdateUserEmailForm from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import userEvent from '@testing-library/user-event'
import Toast from 'components/Toast'

const server = setupServer()

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders a message if the user email has been updated', async () => {
  server.use(
    http.put('http://localhost/api/user', async ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({ email: 'john@test.com' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserEmailForm />
    </>
  )

  const emailInput = screen.getByRole('textbox')

  await userEvent.type(emailInput, 'john@test.com')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('Your email has been updated! 🎉')
})

it('renders an error if it fails to update the user email', async () => {
  server.use(
    http.put('http://localhost/api/user', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserEmailForm />
    </>
  )

  const emailInput = screen.getByRole('textbox')

  await userEvent.type(emailInput, 'john@test.com')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('gives the focus to the email input if it fails to update the user email', async () => {
  server.use(
    http.put('http://localhost/api/user', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(<UpdateUserEmailForm />)

  const emailInput = screen.getByRole('textbox')

  await userEvent.type(emailInput, 'john@test.com')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  expect(emailInput).toHaveFocus()
})
