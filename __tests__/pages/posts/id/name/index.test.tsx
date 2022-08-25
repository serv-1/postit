import { render, screen } from '@testing-library/react'
import Name from '../../../../../pages/posts/[id]/[name]'
import { ILightPost, IPost, IUser } from '../../../../../types/common'
import userEvent from '@testing-library/user-event'

jest.mock('../../../../../components/PostPageFavoriteButton', () => ({
  __esModule: true,
  default: () => <button>favorite</button>,
}))

jest.mock('../../../../../components/PostPageUpdateButtons', () => ({
  __esModule: true,
  default: () => <button>update</button>,
}))

jest.mock('../../../../../components/PostPageMap', () => ({
  __esModule: true,
  default: () => <div></div>,
}))

jest.mock('../../../../../components/PostPageContactModal', () => ({
  __esModule: true,
  default: () => <button>contact</button>,
}))

const post: IPost = {
  id: '0',
  name: 'Table',
  description: 'Magnificent table',
  categories: ['furniture' as const],
  price: 5000.12,
  images: ['/table.jpeg'],
  address: 'Oslo, Norway',
  latLon: [17, 45],
  discussionsIds: [],
  user: {
    id: '0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/default.jpg',
    posts: [],
  },
}

const user: IUser = {
  id: '0',
  name: 'Bob',
  email: 'bob@bob.bob',
  image: '/bob.jpeg',
  posts: [],
  favPosts: [],
  discussionsIds: [],
  channelName: 'test',
  hasUnseenMessages: false,
}

const useToast = jest.spyOn(
  require('../../../../../contexts/toast'),
  'useToast'
)

beforeEach(() => useToast.mockReturnValue({ setToast: () => null }))

it('renders', () => {
  render(<Name post={post} />)

  const documentTitle = screen.getByTestId('documentTitle')
  expect(documentTitle).toHaveTextContent(post.name)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/table.jpeg')
  expect(img).toHaveAttribute('alt', post.name)

  const favBtn = screen.getByRole('button', { name: /favorite/i })
  expect(favBtn).toBeInTheDocument()

  const link = screen.getByRole('link', { name: /john doe/i })
  expect(link).toHaveAttribute('href', `/users/${post.user.id}/John-Doe`)

  const contactBtn = screen.getByRole('button', { name: /contact/i })
  expect(contactBtn).toBeInTheDocument()

  const name = screen.getByRole('heading', { level: 1 })
  expect(name).toHaveTextContent(post.name)

  const price = screen.getByText('5 000,12€')
  expect(price).toBeInTheDocument()

  const description = screen.getByText(post.description)
  expect(description).toBeInTheDocument()

  const userOtherPostsTitle = screen.queryByRole('heading', { level: 2 })
  expect(userOtherPostsTitle).not.toBeInTheDocument()
})

it('renders the update buttons if the signed in user is the post author', () => {
  render(<Name post={post} user={user} />)

  const updateBtnsText = screen.getByText(/manage your post/i)
  expect(updateBtnsText).toBeInTheDocument()

  const updateBtns = screen.getAllByRole('button', { name: /update/i })
  expect(updateBtns).toHaveLength(2)
})

test('the arrow left redirect to the previous page', async () => {
  const back = jest.fn()
  Object.defineProperty(window, 'history', { get: () => ({ back }) })

  render(<Name post={post} />)

  const arrowLeft = screen.getByRole('button', { name: /go back/i })
  await userEvent.click(arrowLeft)

  expect(back).toHaveBeenCalledTimes(1)
})

it("renders author's other posts section if the user is unauthenticated and the author has created another post", () => {
  const userPost: ILightPost = {
    name: 'Chair',
    price: 25,
    image: '/static/images/posts/chair.jpeg',
    address: 'Oslo, Norway',
    id: '0',
  }
  const p = { ...post, user: { ...post.user, posts: [userPost] } }

  render(<Name post={p} />)

  const otherPostsTitle = screen.getByRole('heading', { level: 2 })
  expect(otherPostsTitle).toHaveTextContent(p.user.name + "'s other posts")

  const links = screen.getAllByRole('link', { name: /john doe/i })
  expect(links[links.length - 1]).toHaveAttribute('href', '/users/0/John-Doe')
})

it("renders author's other posts section if the signed in user isn't the post author and the author has created another post", () => {
  const userPost: ILightPost = {
    name: 'Chair',
    price: 25,
    image: '/static/images/posts/chair.jpeg',
    address: 'Oslo, Norway',
    id: '0',
  }
  const p = { ...post, user: { ...post.user, posts: [userPost] } }
  const u = { ...user, id: '1' }

  render(<Name post={p} user={u} />)

  const otherPostsTitle = screen.getByRole('heading', { level: 2 })
  expect(otherPostsTitle).toBeInTheDocument()
})

it("doesn't render author's other posts section if the signed in user is the post author", () => {
  const userPost: ILightPost = {
    name: 'Chair',
    price: 25,
    image: '/static/images/posts/chair.jpeg',
    address: 'Oslo, Norway',
    id: '0',
  }
  const p = { ...post, user: { ...post.user, posts: [userPost] } }

  render(<Name post={p} user={user} />)

  const otherPostsTitle = screen.queryByRole('heading', { level: 2 })
  expect(otherPostsTitle).not.toBeInTheDocument()
})
