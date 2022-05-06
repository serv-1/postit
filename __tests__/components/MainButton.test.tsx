import MainButton from '../../components/MainButton'
import { render, screen } from '@testing-library/react'

it('renders with the default classes', () => {
  render(
    <MainButton type="submit" className="red">
      Submit
    </MainButton>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveAttribute('type', 'submit')
  expect(btn).toHaveTextContent('Submit')
  expect(btn).toHaveClass(
    'bg-fuchsia-600 hover:bg-fuchsia-300 focus:bg-fuchsia-300',
    'text-fuchsia-50 hover:text-fuchsia-900 focus:text-fuchsia-900',
    'rounded px-16 py-8 red'
  )
})

it('renders with the given classes', () => {
  render(
    <MainButton
      bgColor={{ base: 'bg-red', states: 'hover:bg-blue' }}
      textColor={{ base: 'text-blue', states: 'hover:text-red' }}
      radius="rounded-none"
      padding="p-0"
      className="black"
    >
      Ok
    </MainButton>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass(
    'bg-red hover:bg-blue text-blue hover:text-red rounded-none p-0 black'
  )
})

it('renders with the states removed', () => {
  render(
    <MainButton bgColor={{ states: false }} textColor={{ states: false }}>
      Ok
    </MainButton>
  )

  const btn = screen.getByRole('button')
  expect(btn.className).not.toContain('hover')
})
