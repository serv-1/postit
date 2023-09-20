import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost/api/user', (req, res, ctx) => {
    return res(ctx.status(201), ctx.set('Location', '/profile'))
  }),
  rest.put('http://localhost/api/user', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
  rest.delete('http://localhost/api/user', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
]

export default handlers
