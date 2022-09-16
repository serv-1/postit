import { rest } from 'msw'

const handlers = [
  rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
]

export default handlers
