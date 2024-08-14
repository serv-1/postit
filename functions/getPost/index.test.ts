/**
 * @jest-environment node
 */

import getPost from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the post', async () => {
  const post = { id: '0' }

  server.use(
    rest.get('http://localhost/api/posts/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json(post))
    })
  )

  expect(await getPost('0')).toEqual(post)
})

it('returns an error if the request fails', async () => {
  server.use(
    rest.get('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  await expect(getPost('0')).rejects.toThrow('error')
})
