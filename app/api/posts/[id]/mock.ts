import { rest } from 'msw'

const handlers = [
  rest.put('http://localhost/api/posts/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
  rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
]

export default handlers
