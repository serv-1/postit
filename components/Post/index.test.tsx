import Post from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

const defaultPost = {
  id: '0',
  name: 'Cat',
  price: 5000,
  image: 'keyName',
  address: 'Oslo, Norway',
}

it('renders', async () => {
  const { id, name, image, address } = defaultPost

  render(<Post {...defaultPost} />)

  const addressBtn = screen.getByRole('button')
  await userEvent.click(addressBtn)

  const addressText = screen.getByText(address)
  expect(addressText).toBeInTheDocument()

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/' + image)
  expect(img).toHaveAttribute('alt', name)

  const link = screen.getByRole('link')
  expect(link).toHaveTextContent(name)

  const href = `/posts/${id}/${name.replaceAll(' ', '-')}`
  expect(link).toHaveAttribute('href', href)

  const priceText = screen.getByText(/5 000/)
  expect(priceText).toBeInTheDocument()
})
