import { render, screen } from '@testing-library/react'
import RightPanel from '../../components/RightPanel'

it('renders', () => {
  render(
    <RightPanel>
      <h1></h1>
    </RightPanel>
  )

  const panel = screen.getByRole('heading').parentElement
  expect(panel).toHaveClass('md:bg-linear-wrapper')
})

it('renders in an error page', () => {
  render(
    <RightPanel errorPage>
      <h1></h1>
    </RightPanel>
  )

  const panel = screen.getByRole('heading').parentElement
  expect(panel).toHaveClass('md:bg-fuchsia-900')
})
