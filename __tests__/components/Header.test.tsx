import { render, screen } from '@testing-library/react'
import Header from '../../components/Header'

jest.mock('../../components/HeaderDropdownMenu', () => ({
  __esModule: true,
  default: () => <ul></ul>,
}))

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeEach(() => useSession.mockReturnValue({ status: 'loading' }))

test("the default menu doesn't render", () => {
  render(<Header noMenu />)

  const list = screen.queryByRole('list')
  expect(list).not.toBeInTheDocument()

  const header = screen.getByRole('banner')
  expect(header).toHaveClass('justify-center')
})

test('the given children render', () => {
  render(
    <Header>
      <nav></nav>
    </Header>
  )

  const nav = screen.getByRole('navigation')
  expect(nav).toBeInTheDocument()

  const header = screen.getByRole('banner')
  expect(header).toHaveClass('justify-between')
})

test("the default menu doesn'\t render while the session hasn't been fetched yet", () => {
  render(<Header className="red" />)

  const defaultMenu = screen.queryByRole('navigation')
  expect(defaultMenu).not.toBeInTheDocument()

  const header = screen.getByRole('banner')
  expect(header).toHaveClass('justify-between', 'red')
})

test('the sign in link renders if the user is unauthenticated', () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })
  render(<Header />)

  const signInLink = screen.getByRole('link', { name: /sign in/i })
  expect(signInLink).toBeInTheDocument()
})

test('the menu renders if the user is authenticated', () => {
  useSession.mockReturnValue({ status: 'authenticated' })
  render(<Header />)

  const menu = screen.getAllByRole('list')[0]
  expect(menu).toBeInTheDocument()
})
