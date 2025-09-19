/**
 * @jest-environment node
 */

import getUser from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the user', async () => {
  const user = { id: '0' }

  server.use(
    http.get('http://localhost/api/users/:id', ({ params }) => {
      expect(params.id).toBe('0')

      return HttpResponse.json(user, { status: 200 })
    })
  )

  expect(await getUser('0')).toEqual(user)
})

it('returns an error if the request fails', async () => {
  server.use(
    http.get('http://localhost/api/users/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  await expect(getUser('0')).rejects.toThrow('error')
})
