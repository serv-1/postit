import { render, screen } from '@testing-library/react'
import Header from '.'
import { usePathname } from 'next/navigation'
import type { User } from 'types'

jest
  .mock('next/navigation', () => ({
    usePathname: jest.fn(),
  }))
  .mock('components/HeaderDiscussions', () => ({
    __esModule: true,
    default: () => <div></div>,
  }))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

const signedInUser: User = {
  _id: '0',
  name: 'john',
  email: 'john@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

it('renders the sign in link if the user is unauthenticated', () => {
  mockUsePathname.mockReturnValue('/')

  render(<Header />)

  const link = screen.getByRole('link', { name: /sign in/i })

  expect(link).toBeInTheDocument()
})

it('renders the menu if the user is authenticated', () => {
  mockUsePathname.mockReturnValue('/')

  render(<Header signedInUser={signedInUser} />)

  const link = screen.getByRole('link', { name: /create a post/i })

  expect(link).toBeInTheDocument()
})

it('renders without the sign in link if the user is on the authentication page', () => {
  mockUsePathname.mockReturnValue('/authentication')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('justify-center')

  const link = screen.queryByRole('link', { name: /sign in/i })

  expect(link).not.toBeInTheDocument()
})

it("isn't displayed on mobile screen if the user is on a post page", () => {
  mockUsePathname.mockReturnValue('/posts/000000000000000000000000/table')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('hidden md:flex')
})

it("is displayed on mobile screen if the user isn't on a post page", () => {
  mockUsePathname.mockReturnValue('/create-a-post')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('flex')
})

it('is displayed on mobile screen if the user is on a post update page', () => {
  mockUsePathname.mockReturnValue('/posts/0/table/update')

  render(<Header />)

  const header = screen.getByRole('banner')

  expect(header).toHaveClass('flex')
})
