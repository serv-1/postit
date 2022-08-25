import { render, screen } from '@testing-library/react'
import UserPage from '../../../../pages/users/[id]/[name]'

const user = {
  id: '0',
  name: 'john',
  email: 'john@jo.hn',
  image: 'john.jpeg',
  posts: [],
  favPosts: [],
  discussionsIds: [],
  hasUnseenMessages: false,
  channelName: 'test',
}
const post = {
  id: '0',
  name: 'table',
  description: 'magnificent table',
  categories: ['furniture' as const],
  price: 50,
  images: ['table.jpeg'],
  userId: '0',
  discussionsIds: [],
  address: 'Oslo, Norway',
  latLon: [58, 42] as [number, number],
}

it('renders', () => {
  render(<UserPage user={user} />)

  const title = screen.getByRole('heading')
  expect(title).toHaveTextContent(user.name)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', user.image)
  expect(img.getAttribute('alt')).toContain(user.name)

  const posts = screen.getByRole('status')
  expect(posts).toHaveTextContent(user.name)
})

it('renders the user posts', () => {
  render(<UserPage user={{ ...user, posts: [post, { ...post, id: '1' }] }} />)

  const title = screen.getByRole('heading', { level: 2 })
  expect(title).toHaveTextContent('Its 2 posts')

  const postsNames = screen.getAllByText(/table/i)
  expect(postsNames).toHaveLength(2)
})

it('renders "post" in the singular if there is only one post', () => {
  render(<UserPage user={{ ...user, posts: [post] }} />)

  const title = screen.getByRole('heading', { level: 2 })
  expect(title).toHaveTextContent('Its 1 post')
})
