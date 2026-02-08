import { render, screen } from '@testing-library/react'
import Accordion from '.'
import userEvent from '@testing-library/user-event'

it('renders', () => {
  render(
    <Accordion title="Test" id="test" headingLevel={1}>
      Hooo
    </Accordion>
  )

  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveAttribute('id', 'test-accordionHeader')

  const btn = screen.getByRole('button')
  expect(btn).toHaveAttribute('aria-expanded', 'false')
  expect(btn).toHaveAttribute('aria-controls', 'test-accordionPanel')
  expect(btn).toHaveTextContent('Test')

  const chevronDown = screen.getByTestId('chevronDown')
  expect(chevronDown).toBeInTheDocument()

  const panel = screen.queryByRole('region')
  expect(panel).not.toBeInTheDocument()
})

it('renders the panel', async () => {
  render(
    <Accordion title="Test" id="test" headingLevel={1}>
      <a href="#"></a>
    </Accordion>
  )

  const btn = screen.getByRole('button')
  await userEvent.click(btn)
  expect(btn).toHaveAttribute('aria-expanded', 'true')

  const chevronUp = screen.getByTestId('chevronUp')
  expect(chevronUp).toBeInTheDocument()

  const panel = screen.getByRole('region')
  expect(panel).toHaveAttribute('id', 'test-accordionPanel')
  expect(panel).toHaveAttribute('aria-labelledby', 'test-accordionHeader')

  const children = screen.getByRole('link')
  expect(children).toBeInTheDocument()
})

it('opens and closes', async () => {
  render(
    <Accordion title="Test" id="test" headingLevel={1}>
      doot
    </Accordion>
  )

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  let panel = screen.getByRole('region')
  expect(panel).toBeInTheDocument()

  await userEvent.click(btn)
  expect(panel).not.toBeInTheDocument()

  await userEvent.keyboard('{Enter}')
  panel = screen.getByRole('region')
  expect(panel).toBeInTheDocument()

  await userEvent.click(btn)
  expect(panel).not.toBeInTheDocument()

  await userEvent.keyboard('{ }')
  panel = screen.getByRole('region')
  expect(panel).toBeInTheDocument()
})
