import { render, screen } from '@testing-library/react'
import UserPage from '.'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'

jest.mock('components/Header', () => ({
  __esModule: true,
  default: () => <header></header>,
}))

it('renders', () => {
  render(
    <UserPage
      user={{
        id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'key',
        posts: [],
        favPostIds: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const title = screen.getByRole('heading')

  expect(title).toHaveTextContent('john')

  const img = screen.getByRole('img')

  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
  expect(img.getAttribute('alt')).toContain('john')

  const posts = screen.getByRole('status')

  expect(posts).toHaveTextContent('john')
})

it('renders the default user image', () => {
  render(
    <UserPage
      user={{
        id: '0',
        name: 'john',
        email: 'john@test.com',
        posts: [],
        favPostIds: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const img = screen.getByRole('img')

  expect(img).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
})

it('renders the user posts', () => {
  render(
    <UserPage
      user={{
        id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'key',
        posts: [
          {
            id: '0',
            name: 'table',
            description: 'magnificent table',
            categories: ['furniture'],
            price: 50,
            images: ['key'],
            userId: '0',
            discussionIds: [],
            address: 'Oslo, Norway',
            latLon: [58, 42],
          },
          {
            id: '1',
            name: 'chair',
            description: 'magnificent chair',
            categories: ['furniture'],
            price: 20,
            images: ['key'],
            userId: '0',
            discussionIds: [],
            address: 'Oslo, Norway',
            latLon: [58, 42],
          },
        ],
        favPostIds: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const title = screen.getByRole('heading', { level: 2 })

  expect(title).toHaveTextContent('Its 2 posts')

  const table = screen.getByText('table')

  expect(table).toBeInTheDocument()

  const chair = screen.getByText('chair')

  expect(chair).toBeInTheDocument()
})

it('renders "post" in the singular if there is only one post', () => {
  render(
    <UserPage
      user={{
        id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'key',
        posts: [
          {
            id: '0',
            name: 'table',
            description: 'magnificent table',
            categories: ['furniture'],
            price: 50,
            images: ['key'],
            userId: '0',
            discussionIds: [],
            address: 'Oslo, Norway',
            latLon: [58, 42],
          },
        ],
        favPostIds: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const title = screen.getByRole('heading', { level: 2 })

  expect(title).toHaveTextContent('Its 1 post')
})
