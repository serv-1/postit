/**
 * @jest-environment node
 */

import getPost from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the post', async () => {
  const post = { id: '0' }

  server.use(
    http.get('http://localhost/api/posts/:id', ({ params }) => {
      expect(params.id).toBe('0')

      return HttpResponse.json(post, { status: 200 })
    })
  )

  expect(await getPost('0')).toEqual(post)
})

it('returns an error if the request fails', async () => {
  server.use(
    http.get('http://localhost/api/posts/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  await expect(getPost('0')).rejects.toThrow('error')
})
