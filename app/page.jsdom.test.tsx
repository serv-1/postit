import Page from './page'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render, screen } from '@testing-library/react'

vi.mock('components/SearchPostForm', () => ({
  default: () => <div></div>,
}))

vi.mock('components/PostList', () => ({
  default: () => <ul></ul>,
}))

vi.mock('components/Pagination', () => ({
  default: () => <div></div>,
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders "Search something" if no search request have been made', async () => {
  render(await Page({ searchParams: Promise.resolve({}) }))

  const text = screen.getByText('Search something')

  expect(text).toBeInTheDocument()
})

it('renders "No posts found" if no posts have been found', async () => {
  const mockTest = vi.fn()

  server.use(
    http.get('http://localhost/api/posts/search', () => {
      mockTest()
      return HttpResponse.json(
        { posts: [], totalPosts: 0, totalPages: 0 },
        { status: 200 },
      )
    }),
  )

  render(await Page({ searchParams: Promise.resolve({ query: 'cat' }) }))

  const text = screen.getByText('No posts found')

  expect(text).toBeInTheDocument()
})

it('renders the post list if posts have been found', async () => {
  server.use(
    http.get('http://localhost/api/posts/search', () => {
      return HttpResponse.json(
        { posts: [{ id: '0' }], totalPosts: 1, totalPages: 1 },
        { status: 200 },
      )
    }),
  )

  render(await Page({ searchParams: Promise.resolve({ query: 'cat' }) }))

  const postList = screen.getByRole('list')

  expect(postList).toBeInTheDocument()
})

it('renders an "s" if more than 1 post has been found', async () => {
  server.use(
    http.get('http://localhost/api/posts/search', () => {
      return HttpResponse.json(
        {
          posts: [{ id: '0' }, { id: '1' }],
          totalPosts: 2,
          totalPages: 1,
        },
        { status: 200 },
      )
    }),
  )

  render(await Page({ searchParams: Promise.resolve({ query: 'cat' }) }))

  const text = screen.getByText('2 posts found')

  expect(text).toBeInTheDocument()
})

it('doesn\'t render an "s" if only 1 post has been found', async () => {
  server.use(
    http.get('http://localhost/api/posts/search', () => {
      return HttpResponse.json(
        { posts: [{ id: '0' }], totalPosts: 1, totalPages: 1 },
        { status: 200 },
      )
    }),
  )

  render(await Page({ searchParams: Promise.resolve({ query: 'cat' }) }))

  const text = screen.getByText('1 post found')

  expect(text).toBeInTheDocument()
})
