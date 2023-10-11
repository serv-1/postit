import { render, screen } from '@testing-library/react'
import Header from '.'
import { usePathname } from 'next/navigation'

jest
  .mock('next/dynamic', () => ({
    __esModule: true,
    default: () => () => <ul></ul>,
  }))
  .mock('components/HeaderDropdownMenu', () => ({
    __esModule: true,
    default: () => <ul></ul>,
  }))
  .mock('next/navigation', () => ({
    usePathname: jest.fn(),
  }))

const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

it('renders the sign in link if the user is unauthenticated', () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })
  mockUsePathname.mockReturnValue('/')

  render(<Header />)

  const link = screen.getByRole('link', { name: /sign in/i })

  expect(link).toBeInTheDocument()
})

it('renders the menu if the user is authenticated', () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })
  mockUsePathname.mockReturnValue('/')

  render(<Header />)

  const link = screen.getByRole('link', { name: /create a post/i })

  expect(link).toBeInTheDocument()
})

it('renders without the sign in link if the user is on the authentication page', () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })
  mockUsePathname.mockReturnValue('/authentication')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('justify-center')

  const link = screen.queryByRole('link', { name: /sign in/i })

  expect(link).not.toBeInTheDocument()
})

it("isn't displayed on mobile screen if the user is on the post's page", () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })
  mockUsePathname.mockReturnValue('/posts/0/table')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('hidden md:flex')
})

it("is displayed on mobile screen if the user isn't on the post's page", () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })
  mockUsePathname.mockReturnValue('/create-a-post')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('flex')
})

it("is displayed on mobile screen if the user is on the post's update page", () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })
  mockUsePathname.mockReturnValue('/posts/0/table/update')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('flex')
})
