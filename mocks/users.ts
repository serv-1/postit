import { rest } from 'msw'

const handlers = [
  rest.post('http://localhost:3000/api/users', (req, res, ctx) => {
    return res(
      ctx.status(422),
      ctx.json({
        message: 'This email is not registered.',
        name: 'email',
      })
    )
  }),
]

export default handlers
