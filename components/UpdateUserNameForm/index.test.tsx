import { render, screen } from '@testing-library/react'
import UpdateUserNameForm from '.'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import ProfileUserName from 'components/ProfileUserName'
import Toast from 'components/Toast'
import userEvent from '@testing-library/user-event'

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders a message if the user name has been updated', async () => {
  server.use(
    http.put('http://localhost/api/user', async ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({ name: 'john' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserNameForm />
    </>
  )

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('Your name has been updated! 🎉')
})

it('updates the username if it has been updated', async () => {
  server.use(
    http.put('http://localhost/api/user', async ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({ name: 'john' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(
    <>
      <ProfileUserName name="bob" />
      <UpdateUserNameForm />
    </>
  )

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const username = screen.getByRole('heading')

  expect(username).toHaveTextContent('john')
})

it('renders an error if it fails to update the user name', async () => {
  server.use(
    http.put('http://localhost/api/user', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserNameForm />
    </>
  )

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('gives the focus to the name input if it fails to update the user name', async () => {
  server.use(
    http.put('http://localhost/api/user', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(<UpdateUserNameForm />)

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  expect(nameInput).toHaveFocus()
})
