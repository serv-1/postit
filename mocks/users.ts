import { rest } from 'msw'
import { emailUsed } from '../utils/errors'

const handlers = [
  rest.post('http://localhost:3000/api/users', (req, res, ctx) => {
    return res(
      ctx.status(422),
      ctx.json({
        name: 'email',
        message: emailUsed,
      })
    )
  }),
]

export default handlers
