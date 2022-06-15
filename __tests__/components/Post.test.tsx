import Post from '../../components/Post'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const defaultPost = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Cat',
  price: 5000,
  image: 'data:image/jpeg;base64,base64=',
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
  expect(img).toHaveAttribute('src', image)
  expect(img).toHaveAttribute('alt', name)

  const link = screen.getByRole('link')
  expect(link).toHaveTextContent(name)

  const href = `/posts/${id}/${name.replaceAll(' ', '-')}`
  expect(link).toHaveAttribute('href', href)

  const priceText = screen.getByText(/5 000/)
  expect(priceText).toBeInTheDocument()
})

test("its name should be truncated if it's too long", () => {
  const name = new Uint8Array(90).join('')

  render(<Post {...defaultPost} name={name} />)

  const text = screen.queryByText(name)
  expect(text).not.toBeInTheDocument()
})
