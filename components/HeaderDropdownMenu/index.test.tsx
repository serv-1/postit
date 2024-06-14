import HeaderDropdownMenu from '.'
import { render, screen } from '@testing-library/react'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'

it('renders the user image', async () => {
  render(<HeaderDropdownMenu userImage="test.png" />)

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/test.png')
})

it('renders the default user image', async () => {
  render(<HeaderDropdownMenu />)

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
})
