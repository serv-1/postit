import { render, screen } from '@testing-library/react'
import PostList from '../../components/PostList'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

const defaultPosts = [
  {
    id: '0',
    name: 'Cat',
    price: 40,
    image: 'keyName',
    address: 'Oslo, Norway',
  },
]

it('renders', () => {
  render(<PostList posts={defaultPosts} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', awsUrl + defaultPosts[0].image)
})
