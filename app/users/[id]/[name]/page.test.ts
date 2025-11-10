import getUser from 'functions/getUser'
import Page, { generateMetadata } from './page'
import getPosts from 'functions/getPosts'
import type { Post, User } from 'types'
import { render, screen } from '@testing-library/react'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'

jest
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>
const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>

const user: User = {
  _id: '0',
  name: 'john',
  email: 'john@test.com',
  image: 'john.jpeg',
  channelName: 'test',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

const post: Post = {
  _id: '0',
  name: 'table',
  images: ['table.jpeg'],
  address: 'Paris',
  price: 40,
  categories: ['furniture'],
  discussionIds: [],
  userId: '0',
  description: 'I sell this table.',
  latLon: [42, 58],
}

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetUser.mockResolvedValue(user)

    expect(
      await generateMetadata({
        params: Promise.resolve({ id: '0', name: 'john' }),
      })
    ).toEqual({
      title: "john's profile - PostIt",
    })
  })
})

describe('<Page />', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue(user)
    mockGetPosts.mockResolvedValue([])
  })

  it("renders the default user's image", async () => {
    mockGetUser.mockResolvedValue({ ...user, image: undefined })

    render(await Page({ params: Promise.resolve({ id: '0', name: 'john' }) }))

    const image = screen.getByRole('img')

    expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
    expect(image).toHaveAttribute('alt', "john's profile image")
  })

  it("renders the user's image", async () => {
    render(await Page({ params: Promise.resolve({ id: '0', name: 'john' }) }))

    const image = screen.getByRole('img')

    expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.jpeg')
  })

  it("renders the user's posts", async () => {
    mockGetPosts.mockResolvedValue([
      post,
      {
        ...post,
        _id: '1',
        name: 'chair',
        images: ['chair.jpeg'],
        description: 'I sell this chair.',
      },
    ])

    render(await Page({ params: Promise.resolve({ id: '0', name: 'john' }) }))

    const nbOfPosts = screen.getByRole('heading', { level: 2 })

    expect(nbOfPosts).toHaveTextContent(/2 posts/i)
  })

  it('doesn\'t render an "s" if the user has only one post', async () => {
    mockGetPosts.mockResolvedValue([post])

    render(await Page({ params: Promise.resolve({ id: '0', name: 'john' }) }))

    const nbOfPosts = screen.getByRole('heading', { level: 2 })

    expect(nbOfPosts).toHaveTextContent(/1 post/i)
  })

  it('renders the status text if the user has no posts', async () => {
    render(await Page({ params: Promise.resolve({ id: '0', name: 'john' }) }))

    const statusText = screen.getByRole('status')

    expect(statusText).toHaveTextContent(/john/i)
  })
})
