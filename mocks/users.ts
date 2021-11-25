import { rest } from 'msw'

const usersHandlers = [
  rest.post('http://localhost:3000/api/users', (req, res, ctx) => {
    const email = (req.body as { email: string; password: string }).email

    if (email === 'axios@405.com') {
      return res(
        ctx.status(405),
        ctx.json({
          message:
            'Request go brrr! Try to refresh the page and submit the form again.',
        })
      )
    } else if (email === 'alreadyUsed@email.com') {
      return res(
        ctx.status(422),
        ctx.json({ message: 'The email is already used.', name: 'email' })
      )
    }

    return res(ctx.status(302), ctx.set('Location', 'http://localhost:3000/'))
  }),
]

export default usersHandlers
