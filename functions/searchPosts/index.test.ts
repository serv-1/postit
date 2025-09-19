/**
 * @jest-environment node
 */

import searchPosts from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the search result', async () => {
  const searchParams = 'query=cat&categories=animal'
  const searchResult = { posts: [], totalPosts: 0, totalPages: 0 }

  server.use(
    http.get('http://localhost/api/posts/search', ({ request }) => {
      const url = new URL(request.url)

      expect(url.searchParams.toString()).toBe(searchParams)

      return HttpResponse.json(searchResult, { status: 200 })
    })
  )

  expect(await searchPosts(searchParams)).toEqual(searchResult)
})

it('returns an error if the request fails', async () => {
  server.use(
    http.get('http://localhost/api/posts/search', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  await expect(searchPosts('query=cat&categories=animal')).rejects.toThrow(
    'error'
  )
})
