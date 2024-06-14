import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import Page, { generateMetadata } from './page'
import getPost from 'functions/getPost'
import getUser from 'functions/getUser'
import getUserPosts from 'functions/getUserPosts'
import type { Post, User } from 'types'
import { mockGetServerSession } from '__mocks__/next-auth'
import { render, screen } from '@testing-library/react'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'
import type { ContactModalProps } from 'components/ContactModal'

const mockGetContactModalProps = jest.fn()

jest
  .mock('functions/getPost', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getUser', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/getUserPosts', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next-auth')
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ toast: {}, setToast() {} }),
  }))
  .mock('components/PostPageMap', () => ({
    __esModule: true,
    default: () => <div></div>,
  }))
  .mock('components/ContactModal', () => ({
    __esModule: true,
    default: (props: ContactModalProps) => {
      mockGetContactModalProps(props)
      return <div role="dialog">contact modal</div>
    },
  }))
  .mock('components/ContactButton', () => ({
    __esModule: true,
    default: () => <button>contact</button>,
  }))
  .mock('next/navigation', () => ({
    useRouter: () => ({}),
  }))

const mockGetPost = getPost as jest.MockedFunction<typeof getPost>
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>

const mockGetUserPosts = getUserPosts as jest.MockedFunction<
  typeof getUserPosts
>

const params = { id: '0', name: 'table' }

describe('generateMetadata()', () => {
  it('generates the metadata', async () => {
    mockGetPost.mockResolvedValue({ name: 'table' } as Post)

    expect(await generateMetadata({ params })).toEqual({
      title: 'table - PostIt',
    })

    expect(mockGetPost).toHaveBeenNthCalledWith(1, '0')
  })
})

describe('<Page />', () => {
  beforeEach(() => {
    mockGetPost.mockResolvedValue({
      id: '0',
      name: 'blue table',
      description: 'magnificent blue table',
      categories: ['furniture'],
      price: 5000.12,
      images: ['img1', 'img2'],
      address: 'Oslo, Norway',
      latLon: [17, 45],
      discussionIds: [],
      userId: '0',
    })

    mockGetUser.mockResolvedValue({
      id: '0',
      name: 'john doe',
      email: 'john@test.com',
      channelName: 'test',
      postIds: [],
      favPostIds: [],
      discussions: [],
    })

    mockGetUserPosts.mockResolvedValue([])

    mockGetServerSession.mockResolvedValue(null)
  })

  it("throws an error if the post hasn't been found", async () => {
    mockGetPost.mockResolvedValue(undefined)

    await expect(Page({ params })).rejects.toThrow(POST_NOT_FOUND)

    expect(mockGetPost).toHaveBeenNthCalledWith(1, '0')
  })

  it("throws an error if the post's author hasn't been found", async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser.mockResolvedValue(undefined)

    await expect(Page({ params })).rejects.toThrow(USER_NOT_FOUND)

    expect(mockGetUser).toHaveBeenNthCalledWith(1, '1')
  })

  it("throws an error if one of the user's posts hasn't been found", async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser.mockResolvedValue({ postIds: ['0', '1'] } as User)
    mockGetUserPosts.mockResolvedValue(undefined)

    await expect(Page({ params })).rejects.toThrow(POST_NOT_FOUND)

    expect(mockGetUserPosts).toHaveBeenNthCalledWith(1, ['1'])
  })

  it("throws an error if the authenticated user hasn't been found", async () => {
    mockGetPost.mockResolvedValue({ userId: '1' } as Post)
    mockGetUser
      .mockResolvedValue(undefined)
      .mockResolvedValueOnce({ postIds: ['0', '1'] } as User)
    mockGetUserPosts.mockResolvedValue([])
    mockGetServerSession.mockResolvedValue({ id: '2' })

    await expect(Page({ params })).rejects.toThrow(USER_NOT_FOUND)

    expect(mockGetUser.mock.calls[1][0]).toBe('2')
  })

  it("renders the post's first image", async () => {
    render(await Page({ params }))

    const image = screen.getByRole('img')

    expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/img1')
    expect(image).toHaveAttribute('alt', 'blue table')
  })

  it("renders the post's name, price and description", async () => {
    render(await Page({ params }))

    const name = screen.getByRole('heading', { level: 1 })

    expect(name).toHaveTextContent(/blue table/i)

    const price = screen.getByText(/5 000,12/)

    expect(price).toBeInTheDocument()

    const description = screen.getByText(/magnificent blue table/i)

    expect(description).toBeInTheDocument()
  })

  describe('if the user is unauthenticated', () => {
    it('renders the favorite button', async () => {
      render(await Page({ params }))

      const favoriteBtn = screen.getByRole('button', { name: /favorite/i })

      expect(favoriteBtn).toBeInTheDocument()
    })

    it("renders the post author's name in a link", async () => {
      render(await Page({ params }))

      const links = screen.getAllByRole('link', { name: /john doe/i })

      expect(links[0]).toHaveAttribute('href', '/users/0/john-doe')
      expect(links[1]).toHaveAttribute('href', '/users/0/john-doe')
    })

    it('renders the contact button', async () => {
      render(await Page({ params }))

      const contactBtn = screen.getByRole('button', { name: /contact/i })

      expect(contactBtn).toBeInTheDocument()
    })

    it("renders the other posts of the post's author", async () => {
      mockGetUserPosts.mockResolvedValue([
        {
          id: '1',
          name: 'chair',
          price: 40,
          address: 'Paris',
          image: 'img',
        },
      ])

      render(await Page({ params }))

      const link = screen.getAllByRole('link', { name: /john doe/i })[2]

      expect(link).toHaveAttribute('href', '/users/0/john-doe')
    })

    it("doesn't render the edit link and the delete button", async () => {
      render(await Page({ params }))

      const editLink = screen.queryByRole('link', { name: /edit/i })

      expect(editLink).not.toBeInTheDocument()

      const deleteBtn = screen.queryByRole('button', { name: /delete/i })

      expect(deleteBtn).not.toBeInTheDocument()
    })

    it('doesn\'t render "manage your post"', async () => {
      render(await Page({ params }))

      const text = screen.queryByText(/manage your post/i)

      expect(text).not.toBeInTheDocument()
    })
  })

  describe("if the authenticated user is the post's author", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ id: '0' })
    })

    it('renders the edit link and the delete button', async () => {
      render(await Page({ params }))

      const editLinks = screen.getAllByRole('link', { name: /edit/i })

      expect(editLinks[0]).toHaveAttribute('href', '/posts/0/blue-table/update')
      expect(editLinks[1]).toHaveAttribute('href', '/posts/0/blue-table/update')

      const deleteBtns = screen.getAllByRole('button', { name: /delete/i })

      expect(deleteBtns).toHaveLength(2)
    })

    it('renders "manage your post"', async () => {
      render(await Page({ params }))

      const text = screen.getByText(/manage your post/i)

      expect(text).toBeInTheDocument()
    })

    it("doesn't render the favorite button", async () => {
      render(await Page({ params }))

      const favoriteBtn = screen.queryByRole('button', { name: /favorite/i })

      expect(favoriteBtn).not.toBeInTheDocument()
    })

    it("doesn't render the post author's name in a link", async () => {
      render(await Page({ params }))

      const link = screen.queryByRole('link', { name: /john doe/i })

      expect(link).not.toBeInTheDocument()
    })

    it("doesn't render the contact modal", async () => {
      render(await Page({ params }))

      const contactBtn = screen.queryByRole('button', { name: /contact/i })

      expect(contactBtn).not.toBeInTheDocument()
    })

    it("doesn't render the other posts of the post's author", async () => {
      mockGetUserPosts.mockResolvedValue([
        {
          id: '1',
          name: 'chair',
          price: 40,
          address: 'Paris',
          image: 'img',
        },
      ])

      render(await Page({ params }))

      const title = screen.queryByRole('heading', {
        level: 2,
        name: /other posts/i,
      })

      expect(title).not.toBeInTheDocument()
    })
  })

  describe("if the authenticated user isn't the post's author", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ id: '1' })

      mockGetUser
        .mockResolvedValueOnce({
          id: '0',
          name: 'john doe',
          email: 'john@test.com',
          channelName: 'test',
          postIds: [],
          favPostIds: [],
          discussions: [],
        })
        .mockResolvedValueOnce({
          id: '1',
          name: 'bob',
          email: 'bob@test.com',
          channelName: 'test',
          postIds: [],
          favPostIds: [],
          discussions: [],
        })
    })

    it('renders the favorite button', async () => {
      render(await Page({ params }))

      const favoriteBtn = screen.getByRole('button', { name: /favorite/i })

      expect(favoriteBtn).toBeInTheDocument()
    })

    it("renders the post author's name in a link", async () => {
      render(await Page({ params }))

      const links = screen.getAllByRole('link', { name: /john doe/i })

      expect(links[0]).toHaveAttribute('href', '/users/0/john-doe')
      expect(links[1]).toHaveAttribute('href', '/users/0/john-doe')
    })

    it('renders the contact modal', async () => {
      mockGetUser
        .mockReset()
        .mockResolvedValueOnce({
          id: '0',
          name: 'john doe',
          email: 'john@test.com',
          channelName: 'test',
          postIds: [],
          favPostIds: [],
          discussions: [],
        })
        .mockResolvedValueOnce({
          id: '1',
          name: 'bob',
          email: 'bob@test.com',
          channelName: 'test',
          postIds: [],
          favPostIds: [],
          discussions: [
            { id: '0', hidden: true, hasNewMessage: false },
            { id: '1', hidden: false, hasNewMessage: false },
            { id: '2', hidden: false, hasNewMessage: false },
          ],
        })

      mockGetPost.mockReset().mockResolvedValueOnce({
        id: '0',
        name: 'blue table',
        description: 'magnificent blue table',
        categories: ['furniture'],
        price: 5000.12,
        images: ['img1', 'img2'],
        address: 'Oslo, Norway',
        latLon: [17, 45],
        discussionIds: ['45', '1', '77'],
        userId: '0',
      })

      render(await Page({ params }))

      const contactModal = screen.getByRole('dialog')
      const contactModalProps = mockGetContactModalProps.mock.calls[0][0]

      expect(contactModal).toBeInTheDocument()
      expect(contactModalProps).toHaveProperty('discussionId', '1')
      expect(contactModalProps).toHaveProperty('isDiscussionHidden', false)
    })

    it("renders the other posts of the post's author", async () => {
      mockGetUserPosts.mockResolvedValue([
        {
          id: '1',
          name: 'chair',
          price: 40,
          address: 'Paris',
          image: 'img',
        },
      ])

      render(await Page({ params }))

      const link = screen.getAllByRole('link', { name: /john doe/i })[2]

      expect(link).toHaveAttribute('href', '/users/0/john-doe')
    })

    it("doesn't render the edit link and the delete button", async () => {
      render(await Page({ params }))

      const editLink = screen.queryByRole('link', { name: /delete/i })

      expect(editLink).not.toBeInTheDocument()

      const deleteBtn = screen.queryByRole('button', { name: /delete/i })

      expect(deleteBtn).not.toBeInTheDocument()
    })

    it('doesn\'t render "manage your post "', async () => {
      render(await Page({ params }))

      const text = screen.queryByText(/manager your post/i)

      expect(text).not.toBeInTheDocument()
    })
  })
})
