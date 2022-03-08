import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import HomePostPage from '../../components/HomePostPage'
import server from '../../mocks/server'
import err from '../../utils/constants/errors'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeEach(() => useToast.mockReturnValue({ setToast: () => null }))

test('an informative text renders if the user have not search something yet', () => {
  render(<HomePostPage />)

  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/search something/i)
})

test('an informative text renders if no posts have been found', async () => {
  server.use(
    rest.get('http://localhost:3000/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ posts: [], totalPosts: 0, totalPages: 0 })
      )
    })
  )

  const search = '?query=ohNooo'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  const text = screen.getByRole('status')
  await waitFor(() => expect(text).toHaveTextContent(/no posts found/i))
})

test('a request is send to fetch the posts matching the query parameters', async () => {
  const search = '?query=cat'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  const post1 = await screen.findByRole('link', { name: /blue cat/i })
  expect(post1).toBeInTheDocument()

  const post2 = await screen.findByRole('link', { name: /red cat/i })
  expect(post2).toBeInTheDocument()
})

test('an error renders if the server fails to fetch the posts', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/posts/search', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.QUERY_REQUIRED }))
    })
  )

  const search = '?oh=no'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: err.QUERY_REQUIRED,
      background: 'danger',
    })
  })
})
