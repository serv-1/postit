import { render, screen, waitFor } from '@testing-library/react'
import AuthGuard from '../../components/AuthGuard'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

test('the AuthGuard redirects unauthenticated user', async () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })

  render(<AuthGuard>Authorized!</AuthGuard>)

  await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1))
})

test('the loading state renders', async () => {
  useSession.mockReturnValue({ status: 'loading' })

  render(<AuthGuard>Authorized!</AuthGuard>)

  const loadingState = screen.getByText(/loading/i)
  expect(loadingState).toBeInTheDocument()
})

test('the child component renders', () => {
  useSession.mockReturnValue({ status: 'authenticated' })

  render(<AuthGuard>Authorized!</AuthGuard>)

  const child = screen.getByText(/authorized/i)
  expect(child).toBeInTheDocument()
})
