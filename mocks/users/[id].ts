import { rest } from 'msw'
import { mockSession } from '../nextAuth'

const handlers = [
  rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
  rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...mockSession.user,
        image: `data:image/jpeg;base64,R5d65e=`,
      })
    )
  }),
]

export default handlers
