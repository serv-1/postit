import PostsPagePost from '../../components/PostsPagePost'
import { render, screen } from '@testing-library/react'

const defaultPost = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Cat',
  price: 50,
  image: 'data:image/jpeg;base64,base64=',
}

test('the post renders correctly', () => {
  const { id, name, price, image } = defaultPost

  render(<PostsPagePost {...defaultPost} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', image)
  expect(img).toHaveAttribute('alt', name)

  const link = screen.getByRole('link')
  expect(link).toHaveTextContent(name)

  const href = `/posts/${id}/${name.replaceAll(' ', '-')}`
  expect(link).toHaveAttribute('href', href)

  const priceText = screen.getByText(price + '€')
  expect(priceText).toBeInTheDocument()
})

test("post's name should be truncated if it is too long", () => {
  const name = new Uint8Array(90).join('')
  render(<PostsPagePost {...defaultPost} name={name} />)

  const text = screen.queryByText(name)
  expect(text).not.toBeInTheDocument()
})
