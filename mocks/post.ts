import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost:3000/api/post', (req, res, ctx) => {
    return res(ctx.status(201), ctx.set('Location', '/api/posts/0/Table'))
  }),
]

export default handlers
