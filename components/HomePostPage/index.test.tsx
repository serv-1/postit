import { render, screen, waitFor } from '@testing-library/react'
import HomePostPage from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import type { Post } from 'types'

const mockSetToast = jest.fn()
const server = setupServer()

const post: Post = {
  _id: '0',
  name: 'Blue cat',
  price: 50,
  images: ['blue-cat.jpeg'],
  address: 'Paris, France',
  latLon: [42, 58],
  categories: ['animal'],
  description: 'I sell this blue cat.',
  userId: '0',
  discussionIds: [],
}

jest.mock('hooks/useToast', () => ({
  __esModule: true,
  default: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders an informative text if no posts have been fetched yet', () => {
  render(<HomePostPage />)

  const text = screen.getByRole('status')

  expect(text).toHaveTextContent(/search something/i)
})

it('renders an informative text if no posts have been found', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      expect(req.url.searchParams.get('query')).toBe('cat')

      return res(
        ctx.status(200),
        ctx.json({ posts: [], totalPosts: 0, totalPages: 0 })
      )
    })
  )

  Object.defineProperty(window, 'location', {
    value: { ...window.location, search: '?query=cat' },
  })

  render(<HomePostPage />)

  const text = screen.getByRole('status')

  await waitFor(() => expect(text).toHaveTextContent(/no posts found/i))
})

it('fetches the posts matching the url search params', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      expect(req.url.searchParams.get('query')).toBe('cat')

      return res(
        ctx.status(200),
        ctx.json({
          posts: [
            post,
            {
              ...post,
              _id: '1',
              name: 'Red cat',
              images: ['red-cat.jpeg'],
              description: 'I sell this red cat.',
            },
          ],
          totalPosts: 2,
          totalPages: 1,
        })
      )
    })
  )

  Object.defineProperty(window, 'location', {
    value: { ...window.location, search: '?query=cat' },
  })

  render(<HomePostPage />)

  const nbOfPostsFound = await screen.findByText(/2 posts found/i)

  expect(nbOfPostsFound).toBeInTheDocument()

  const blueCat = await screen.findByRole('link', { name: /blue cat/i })

  expect(blueCat).toBeInTheDocument()

  const redCat = await screen.findByRole('link', { name: /red cat/i })

  expect(redCat).toBeInTheDocument()
})

it('renders "post" in the singular if there is only one post found', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      expect(req.url.searchParams.get('query')).toBe('cat')

      return res(
        ctx.status(200),
        ctx.json({
          posts: [post],
          totalPosts: 1,
          totalPages: 1,
        })
      )
    })
  )

  Object.defineProperty(window, 'location', {
    value: { ...window.location, search: '?query=cat' },
  })

  render(<HomePostPage />)

  const nbOfPostsFound = await screen.findByText(/1 post found/i)

  expect(nbOfPostsFound).toBeInTheDocument()
})

it('renders an alert if the server fails to fetch the posts', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  Object.defineProperty(window, 'location', {
    value: { ...window.location, search: '?oh=no' },
  })

  render(<HomePostPage />)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})
