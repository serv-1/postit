import { render, screen, waitFor } from '@testing-library/react'
import AuthGuard from '../../components/AuthGuard'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

test('the spinner renders', async () => {
  useSession.mockReturnValue({ status: 'loading' })

  render(<AuthGuard needAuth>Authorized!</AuthGuard>)

  const spinner = screen.getByRole('status')
  expect(spinner).toBeInTheDocument()
})

it('redirects to the sign in page unauthenticated user if the page need authenticated user', async () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })

  render(<AuthGuard needAuth>Authorized!</AuthGuard>)

  await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1))
})

it('renders the page if the page need unauthenticated user and the user is unauthenticated', () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })

  render(<AuthGuard needAuth={false}>Authorized!</AuthGuard>)

  const page = screen.getByText(/authorized/i)
  expect(page).toBeInTheDocument()
})

it('renders the page if the page need authenticated user and the user is authenticated', () => {
  useSession.mockReturnValue({ status: 'authenticated' })

  render(<AuthGuard needAuth>Authorized!</AuthGuard>)

  const page = screen.getByText(/authorized/i)
  expect(page).toBeInTheDocument()
})

it('renders the 403 page if the page need unauthenticated user but the user is authenticated', () => {
  useSession.mockReturnValue({ status: 'authenticated' })

  render(<AuthGuard needAuth={false}>Authorized!</AuthGuard>)

  const page403 = screen.getByText(/403/)
  expect(page403).toBeInTheDocument()
})
