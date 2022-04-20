import { render, screen } from '@testing-library/react'
import Header from '../../components/Header'

jest.mock('../../components/HeaderDefaultMenu', () => ({
  __esModule: true,
  default: () => <nav></nav>,
}))

test('the default menu renders if there is no children and noMenu is false or undefined', () => {
  render(<Header className="red" />)

  const nav = screen.getByRole('navigation')
  expect(nav).toBeInTheDocument()

  const header = screen.getByRole('banner')
  expect(header).toHaveClass('justify-between', 'red')
})

test("the default menu doesn't render if noMenu is true", () => {
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
