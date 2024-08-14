import Page from './page'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { render, screen } from '@testing-library/react'

jest
  .mock('components/SearchPostForm', () => ({
    __esModule: true,
    default: () => <div></div>,
  }))
  .mock('components/PostList', () => ({
    __esModule: true,
    default: () => <ul></ul>,
  }))
  .mock('components/Pagination', () => ({
    __esModule: true,
    default: () => <div></div>,
  }))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders "Search something" if no search request have been made', async () => {
  render(await Page({ searchParams: {} }))

  const text = screen.getByText('Search something')

  expect(text).toBeInTheDocument()
})

it('renders "No posts found" if no posts have been found', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ posts: [], totalPosts: 0, totalPages: 0 })
      )
    })
  )

  render(await Page({ searchParams: { query: 'cat' } }))

  const text = screen.getByText('No posts found')

  expect(text).toBeInTheDocument()
})

it('renders the post list if posts have been found', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ posts: [{ id: '0' }], totalPosts: 1, totalPages: 1 })
      )
    })
  )

  render(await Page({ searchParams: { query: 'cat' } }))

  const postList = screen.getByRole('list')

  expect(postList).toBeInTheDocument()
})

it('renders an "s" if more than 1 post has been found', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          posts: [{ id: '0' }, { id: '1' }],
          totalPosts: 2,
          totalPages: 1,
        })
      )
    })
  )

  render(await Page({ searchParams: { query: 'cat' } }))

  const text = screen.getByText('2 posts found')

  expect(text).toBeInTheDocument()
})

it('doesn\'t render an "s" if only 1 post has been found', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ posts: [{ id: '0' }], totalPosts: 1, totalPages: 1 })
      )
    })
  )

  render(await Page({ searchParams: { query: 'cat' } }))

  const text = screen.getByText('1 post found')

  expect(text).toBeInTheDocument()
})
