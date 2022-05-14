import { render, screen } from '@testing-library/react'
import LeftPanel from '../../components/LeftPanel'

it('renders', () => {
  render(
    <LeftPanel>
      <h1></h1>
    </LeftPanel>
  )

  const panel = screen.getByRole('heading').parentElement
  expect(panel).toHaveClass('md:p-32')
})

it('renders with the given padding', () => {
  render(
    <LeftPanel padding="p-8">
      <h1></h1>
    </LeftPanel>
  )

  const panel = screen.getByRole('heading').parentElement
  expect(panel).toHaveClass('p-8')
})
