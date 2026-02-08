import { render, screen } from '@testing-library/react'
import ProfileUserName from '.'
import { act } from 'react'

it('renders the user name', () => {
  render(<ProfileUserName name="john" />)

  const name = screen.getByRole('heading', { level: 1 })

  expect(name).toHaveTextContent('john')
})

it('renders the new user name', async () => {
  render(<ProfileUserName name="john" />)

  await act(async () => {
    document.dispatchEvent(
      new CustomEvent('updateProfileUserName', {
        detail: { name: 'jane' },
      })
    )
  })

  const name = screen.getByRole('heading', { level: 1 })

  expect(name).toHaveTextContent('jane')
})
