import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost/api/verifyEmail', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
]

export default handlers
