import { render, screen } from '@testing-library/react'
import Post from '../../../../pages/posts/[id]/[name]'
import { IPost } from '../../../../types/common'
import userEvent from '@testing-library/user-event'

const post: IPost = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Table',
  description: 'Magnificent table',
  categories: ['furniture' as const],
  price: 5000.12,
  images: ['/table.jpeg'],
  user: {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/static/images/default.jpg',
    posts: [],
  },
}

it('renders', () => {
  render(<Post post={post} />)

  const documentTitle = screen.getByTestId('documentTitle')
  expect(documentTitle).toHaveTextContent(post.name)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/table.jpeg')
  expect(img).toHaveAttribute('alt', post.name)

  for (const link of screen.getAllByRole('link')) {
    expect(link).toHaveTextContent(post.user.name)
    expect(link).toHaveAttribute('href', `/users/${post.user.id}`)
  }

  const mainTitle = screen.getByRole('heading', { level: 1 })
  expect(mainTitle).toHaveTextContent(post.name)

  const price = screen.getByText('5 000,12€')
  expect(price).toBeInTheDocument()

  const description = screen.getByText(post.description)
  expect(description).toBeInTheDocument()

  const userOtherPostsTitle = screen.queryByRole('heading', { level: 2 })
  expect(userOtherPostsTitle).not.toBeInTheDocument()
})

test('the arrow left redirect to the previous page', async () => {
  const back = jest.fn()
  Object.defineProperty(window, 'history', { get: () => ({ back }) })

  render(<Post post={post} />)

  const arrowLeft = screen.getByRole('button', { name: /go back/i })
  await userEvent.click(arrowLeft)

  expect(back).toHaveBeenCalledTimes(1)
})

it('renders the other posts of the user', () => {
  const p = { ...post }

  p.user.posts.push({
    name: 'Chair',
    price: 25,
    image: '/static/images/posts/chair.jpeg',
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  })

  render(<Post post={post} />)

  const otherPostsTitle = screen.getByRole('heading', { level: 2 })
  expect(otherPostsTitle).toHaveTextContent(p.user.name + "'s other posts")
})
