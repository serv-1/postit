import { render, screen } from '@testing-library/react'
import PostList from '.'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

it('renders', () => {
  render(
    <PostList
      posts={[
        {
          id: '0',
          name: 'Cat',
          price: 40,
          image: 'key',
          address: 'Oslo, Norway',
        },
      ]}
    />
  )

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
})
