import { render, screen } from '@testing-library/react'
import ProfilePostList from '.'
import type { Post } from 'types'

jest.mock('components/ProfilePost', () => ({
  __esModule: true,
  default: () => <div></div>,
}))

const post: Post = {
  _id: '0',
  name: 'table',
  images: ['table.jpg'],
  discussionIds: [],
  address: 'Paris, France',
  latLon: [42, 58],
  price: 40,
  categories: ['furniture'],
  description: 'I sell this table.',
  userId: '0',
}

it('renders the post list if there are posts', () => {
  render(
    <ProfilePostList
      type="default"
      posts={[
        post,
        {
          ...post,
          _id: '1',
          name: 'chair',
          images: ['chair.jpg'],
          description: 'I sell this chair.',
        },
      ]}
      placeholder="test"
    />
  )

  const list = screen.getByRole('list')

  expect(list).toBeInTheDocument()

  const posts = screen.getAllByRole('listitem')

  expect(posts).toHaveLength(2)
})

it('renders a placeholder text if there are no posts', () => {
  render(
    <ProfilePostList type="default" posts={[]} placeholder="placeholder text" />
  )

  const placeholder = screen.getByText('placeholder text')

  expect(placeholder).toBeInTheDocument()
})
