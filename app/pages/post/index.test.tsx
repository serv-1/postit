import { render, screen } from '@testing-library/react'
import PostPage from '.'
import userEvent from '@testing-library/user-event'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast() {}, toast: {} }),
  }))
  .mock('components/Header', () => ({
    __esModule: true,
    default: () => <header></header>,
  }))
  .mock('components/PostPageFavoriteButton', () => ({
    __esModule: true,
    default: () => <button>favorite</button>,
  }))
  .mock('components/PostPageUpdateButtons', () => ({
    __esModule: true,
    default: () => <button>update</button>,
  }))
  .mock('components/PostPageMap', () => ({
    __esModule: true,
    default: () => <div></div>,
  }))
  .mock('components/PostPageContactModal', () => ({
    __esModule: true,
    default: () => <button>contact</button>,
  }))

it('renders', () => {
  render(
    <PostPage
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: [],
        user: { id: '0', name: 'john doe', posts: [] },
      }}
    />
  )

  const img = screen.getByRole('img')

  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
  expect(img).toHaveAttribute('alt', 'table')

  const favBtn = screen.getByRole('button', { name: /favorite/i })

  expect(favBtn).toBeInTheDocument()

  const link = screen.getByRole('link', { name: /john doe/i })

  expect(link).toHaveAttribute('href', '/users/0/john-doe')

  const contactBtn = screen.getByRole('button', { name: /contact/i })

  expect(contactBtn).toBeInTheDocument()

  const name = screen.getByRole('heading', { level: 1 })

  expect(name).toHaveTextContent('table')

  const price = screen.getByText('5 000,12€')

  expect(price).toBeInTheDocument()

  const description = screen.getByText('magnificent table')

  expect(description).toBeInTheDocument()

  const userOtherPostsTitle = screen.queryByRole('heading', { level: 2 })

  expect(userOtherPostsTitle).not.toBeInTheDocument()
})

it('renders the update buttons if the signed in user is the post author', () => {
  render(
    <PostPage
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: [],
        user: { id: '0', name: 'john doe', posts: [] },
      }}
      user={{
        id: '0',
        name: 'Bob',
        email: 'bob@bob.bob',
        image: 'keyName',
        postIds: [],
        favPostIds: [],
        discussionIds: [],
        channelName: 'test',
        hasUnseenMessages: false,
      }}
    />
  )

  const updateBtnsText = screen.getByText(/manage your post/i)

  expect(updateBtnsText).toBeInTheDocument()

  const updateBtns = screen.getAllByRole('button', { name: /update/i })

  expect(updateBtns).toHaveLength(2)
})

it('redirects to the previous page', async () => {
  const back = jest.fn()

  Object.defineProperty(window, 'history', { get: () => ({ back }) })

  render(
    <PostPage
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: [],
        user: { id: '0', name: 'john doe', posts: [] },
      }}
    />
  )

  const arrowLeft = screen.getByRole('button', { name: /go back/i })

  await userEvent.click(arrowLeft)

  expect(back).toHaveBeenCalledTimes(1)
})

it("renders author's other posts section if the user is unauthenticated and the author has created another post", () => {
  render(
    <PostPage
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: [],
        user: {
          id: '0',
          name: 'john doe',
          posts: [
            {
              id: '0',
              name: 'chair',
              price: 25,
              image: 'key',
              address: 'Oslo, Norway',
            },
          ],
        },
      }}
    />
  )

  const otherPostsTitle = screen.getByRole('heading', { level: 2 })

  expect(otherPostsTitle).toHaveTextContent("john doe's other posts")

  const links = screen.getAllByRole('link', { name: /john doe/i })

  expect(links[links.length - 1]).toHaveAttribute('href', '/users/0/john-doe')
})

it("renders author's other posts section if the signed in user isn't the post author and the author has created another post", () => {
  render(
    <PostPage
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: [],
        user: {
          id: '0',
          name: 'john doe',
          posts: [
            {
              id: '0',
              name: 'chair',
              price: 25,
              image: 'key',
              address: 'Oslo, Norway',
            },
          ],
        },
      }}
      user={{
        id: '1',
        name: 'Bob',
        email: 'bob@bob.bob',
        image: 'keyName',
        postIds: [],
        favPostIds: [],
        discussionIds: [],
        channelName: 'test',
        hasUnseenMessages: false,
      }}
    />
  )

  const otherPostsTitle = screen.getByRole('heading', { level: 2 })

  expect(otherPostsTitle).toBeInTheDocument()
})

it("doesn't render author's other posts section if the signed in user is the post author", () => {
  render(
    <PostPage
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: [],
        user: {
          id: '0',
          name: 'john doe',
          posts: [
            {
              id: '0',
              name: 'chair',
              price: 25,
              image: 'key',
              address: 'Oslo, Norway',
            },
          ],
        },
      }}
      user={{
        id: '0',
        name: 'Bob',
        email: 'bob@bob.bob',
        image: 'keyName',
        postIds: [],
        favPostIds: [],
        discussionIds: [],
        channelName: 'test',
        hasUnseenMessages: false,
      }}
    />
  )

  const otherPostsTitle = screen.queryByRole('heading', { level: 2 })

  expect(otherPostsTitle).not.toBeInTheDocument()
})
