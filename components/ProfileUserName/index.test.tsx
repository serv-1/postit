import { render, screen } from '@testing-library/react'
import ProfileUserName from '.'
import { act } from 'react-dom/test-utils'

it('renders the user name', () => {
  render(<ProfileUserName name="john" />)

  const name = screen.getByRole('heading', { level: 1 })

  expect(name).toHaveTextContent('john')
})

it('renders the new user name', () => {
  render(<ProfileUserName name="john" />)

  act(() => {
    document.dispatchEvent(
      new CustomEvent('updateProfileUserName', {
        detail: { name: 'jane' },
      })
    )
  })

  const name = screen.getByRole('heading', { level: 1 })

  expect(name).toHaveTextContent('jane')
})
