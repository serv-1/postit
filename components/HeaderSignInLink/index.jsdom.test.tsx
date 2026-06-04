import setup from 'functions/setup'
import HeaderSignInLink from '.'
import { usePathname } from 'next/navigation'
import { screen } from '@testing-library/react'
import { signIn } from 'next-auth/react'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

const mockUsePathname = vi.mocked(usePathname)
const mockSignIn = vi.mocked(signIn)

it('does not render on authentication page', () => {
  mockUsePathname.mockReturnValue('/authentication')
  setup(<HeaderSignInLink />)

  const link = screen.queryByRole('link')
  expect(link).not.toBeInTheDocument()
})

it('renders when not on authentication page', () => {
  mockUsePathname.mockReturnValue('/')
  setup(<HeaderSignInLink />)

  const link = screen.getByRole('link')
  expect(link).toBeInTheDocument()
})

// [e2e-testing] TO DELETE if e2e tests are added
it('initiates the signin flow on click', async () => {
  mockUsePathname.mockReturnValue('/')
  const { user } = setup(<HeaderSignInLink />)

  const link = screen.getByRole('link')
  await user.click(link)

  expect(mockSignIn).toHaveBeenCalled()
})
