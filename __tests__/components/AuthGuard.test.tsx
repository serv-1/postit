import { render, screen, waitFor } from '@testing-library/react'
import AuthGuard from '../../components/AuthGuard'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

it('renders the spinner', async () => {
  useSession.mockReturnValue({ status: 'loading' })

  render(<AuthGuard>Authorized!</AuthGuard>)

  const spinner = screen.getByRole('status')
  expect(spinner).toBeInTheDocument()
})

it('redirects to the sign in page unauthenticated user', async () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })

  render(<AuthGuard>Authorized!</AuthGuard>)

  await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1))
})

it('renders the page if the user is authenticated', () => {
  useSession.mockReturnValue({ status: 'authenticated' })

  render(<AuthGuard>Authorized!</AuthGuard>)

  const page = screen.getByText(/authorized/i)
  expect(page).toBeInTheDocument()
})
