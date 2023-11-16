import { render, screen } from '@testing-library/react'
import ProfilePublicProfileLink from '.'
import { act } from 'react-dom/test-utils'

it('renders the public profile link', () => {
  render(<ProfilePublicProfileLink id="0" name="john doe" />)

  const link = screen.getByRole('link')

  expect(link).toHaveAttribute('href', '/users/0/john-doe')
})

it('updates the link when the user changes its name', () => {
  render(<ProfilePublicProfileLink id="0" name="john doe" />)

  act(() => {
    document.dispatchEvent(
      new CustomEvent('updateProfileUserName', {
        detail: { name: 'jane doe' },
      })
    )
  })

  const link = screen.getByRole('link')

  expect(link).toHaveAttribute('href', '/users/0/jane-doe')
})
