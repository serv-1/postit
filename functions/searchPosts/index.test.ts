/**
 * @jest-environment node
 */

import searchPosts from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the search result', async () => {
  const searchParams = 'query=cat&categories=animal'
  const searchResult = { posts: [], totalPosts: 0, totalPages: 0 }

  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      expect(req.url.searchParams.toString()).toBe(searchParams)

      return res(ctx.status(200), ctx.json(searchResult))
    })
  )

  expect(await searchPosts(searchParams)).toEqual(searchResult)
})

it('returns an error if the request fails', async () => {
  server.use(
    rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  await expect(searchPosts('query=cat&categories=animal')).rejects.toThrow(
    'error'
  )
})
