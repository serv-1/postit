import getUser from 'functions/getUser'
import Page, { generateMetadata } from './page'
import getUserPosts from 'functions/getUserPosts'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import type { User } from 'types'
import { render, screen } from '@testing-library/react'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'

jest
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getUserPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>
const mockGetUserPosts = getUserPosts as jest.MockedFunction<
  typeof getUserPosts
>

const params = { id: '0', name: 'john' }

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetUser.mockResolvedValue({ name: 'john' } as User)

    expect(await generateMetadata({ params })).toEqual({
      title: "john's profile - PostIt",
    })
  })
})

describe('<Page />', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      id: '0',
      name: 'john doe',
      email: 'john@test.com',
      image: 'john.jpeg',
      channelName: 'test',
      postIds: [],
      favPostIds: [],
      discussions: [],
    })

    mockGetUserPosts.mockResolvedValue([])
  })

  it("throws an error if the user hasn't been found", async () => {
    mockGetUser.mockResolvedValue(undefined)

    await expect(Page({ params })).rejects.toThrow(USER_NOT_FOUND)

    expect(mockGetUser).toHaveBeenNthCalledWith(1, '0')
  })

  it("throws an error if one of the user's posts hasn't been found", async () => {
    mockGetUser.mockResolvedValue({ postIds: ['0'] } as User)
    mockGetUserPosts.mockResolvedValue(undefined)

    await expect(Page({ params })).rejects.toThrow(POST_NOT_FOUND)

    expect(mockGetUserPosts).toHaveBeenNthCalledWith(1, ['0'])
  })

  it("renders the default user's image", async () => {
    mockGetUser.mockResolvedValue({
      postIds: [] as string[],
      name: 'john',
    } as User)

    render(await Page({ params }))

    const image = screen.getByRole('img')

    expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
    expect(image).toHaveAttribute('alt', "john's profile image")
  })

  it("renders the user's image", async () => {
    render(await Page({ params }))

    const image = screen.getByRole('img')

    expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.jpeg')
  })

  it("renders the user's posts", async () => {
    mockGetUserPosts.mockResolvedValue([
      {
        id: '0',
        name: 'table',
        image: 'table.jpeg',
        address: 'Paris',
        price: 40,
      },
      {
        id: '1',
        name: 'chair',
        image: 'chair.jpeg',
        address: 'Paris',
        price: 20,
      },
    ])

    render(await Page({ params }))

    const nbOfPosts = screen.getByRole('heading', { level: 2 })

    expect(nbOfPosts).toHaveTextContent(/2 posts/i)
  })

  it('doesn\'t render an "s" if the user has only one post', async () => {
    mockGetUserPosts.mockResolvedValue([
      {
        id: '0',
        name: 'table',
        image: 'table.jpeg',
        address: 'Paris',
        price: 40,
      },
    ])

    render(await Page({ params }))

    const nbOfPosts = screen.getByRole('heading', { level: 2 })

    expect(nbOfPosts).toHaveTextContent(/1 post/i)
  })

  it('renders the status text if the user has no posts', async () => {
    render(await Page({ params }))

    const statusText = screen.getByRole('status')

    expect(statusText).toHaveTextContent(/john doe/i)
  })
})
