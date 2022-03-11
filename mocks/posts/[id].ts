import { rest } from 'msw'

const handlers = [
  rest.put('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
  rest.delete('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]

export default handlers
