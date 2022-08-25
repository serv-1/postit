import { render, screen } from '@testing-library/react'
import Header from '../../components/Header'

jest.unmock('../../components/Header')

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const HeaderChatListModal = () => <ul></ul>
    return HeaderChatListModal
  },
}))

jest.mock('../../components/HeaderDropdownMenu', () => ({
  __esModule: true,
  default: () => <ul></ul>,
}))

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

it('renders the sign in link if the user is unauthenticated', () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })

  render(<Header />)

  const link = screen.getByRole('link', { name: /sign in/i })
  expect(link).toBeInTheDocument()
})

it('renders the menu if the user is authenticated', () => {
  useSession.mockReturnValue({ status: 'authenticated' })

  render(<Header />)

  const link = screen.getByRole('link', { name: /create a post/i })
  expect(link).toBeInTheDocument()
})
