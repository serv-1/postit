import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost:3000/api/user', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
  rest.put('http://localhost:3000/api/user', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
  rest.delete('http://localhost:3000/api/user', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]

export default handlers
