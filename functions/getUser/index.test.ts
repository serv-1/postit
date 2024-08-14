/**
 * @jest-environment node
 */

import getUser from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the user', async () => {
  const user = { id: '0' }

  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json(user))
    })
  )

  expect(await getUser('0')).toEqual(user)
})

it('returns an error if the request fails', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  await expect(getUser('0')).rejects.toThrow('error')
})
