import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost:3000/api/post', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]

export default handlers
