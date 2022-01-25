import { render, screen } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Header from '../../components/Header'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/constants/errors'
import { mockResponse } from '../../lib/msw'

const factory = (session?: Session | null) => {
  render(
    <SessionProvider session={session}>
      <ToastProvider>
        <Header />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

test('nothing render while the user is not fetched yet', async () => {
  factory()

  const signInLink = screen.queryByRole('link', { name: /sign in/i })
  expect(signInLink).not.toBeInTheDocument()

  const signOutLink = screen.queryByRole('link', { name: /sign out/i })
  expect(signOutLink).not.toBeInTheDocument()

  await screen.findByRole('img')
})

test('the menu loads and renders the user image with the links when he is authenticated', async () => {
  factory(mockSession)

  const spinner = await screen.findByRole('status')
  expect(spinner).toBeInTheDocument()

  const image = await screen.findByRole('img')
  expect(image).toBeInTheDocument()
})

test('an error renders if the server fails to fetch the user image', async () => {
  mockResponse('get', '/api/users/:id', 404, { message: err.USER_NOT_FOUND })

  factory(mockSession)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.USER_NOT_FOUND)
  expect(toast).toHaveClass('bg-danger')

  const image = screen.queryByRole('img')
  expect(image).not.toBeInTheDocument()
})

test('the sign in link renders when the user is unauthenticated', async () => {
  factory(null)

  const signInLink = screen.getByRole('link', { name: /sign in/i })
  expect(signInLink).toBeInTheDocument()
})
