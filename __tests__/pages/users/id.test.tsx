import { render, screen } from '@testing-library/react'
import User from '../../../pages/users/[id]'

jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <header></header>,
}))

it('renders', () => {
  const user = {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/img.jpeg',
    posts: [],
  }

  render(<User user={user} />)

  const title = screen.getByRole('heading')
  expect(title).toHaveTextContent(user.name)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', user.image)

  const posts = screen.getByRole('status')
  expect(posts).toHaveTextContent(user.name)
})

it('renders the user posts', () => {
  const user = {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/img.jpeg',
    posts: [
      {
        id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
        name: 'Table',
        description: 'Magnificent table',
        categories: ['furniture' as const],
        price: 50,
        images: ['/table.jpeg'],
        userId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
      },
    ],
  }

  render(<User user={user} />)

  const title = screen.getByRole('heading', { level: 2 })
  expect(title).toHaveTextContent(String(user.posts.length))

  const regex = new RegExp(user.posts[0].name, 'i')
  const post = screen.getByText(regex)
  expect(post).toBeInTheDocument()
})
