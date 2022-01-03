import { setupServer } from 'msw/node'
import userHandlers from './user'
import usersIdHandlers from './users/[id]'
import nextAuthHandlers from './nextAuth'
import verifyEmailHandlers from './verifyEmail'

const server = setupServer(
  ...userHandlers,
  ...usersIdHandlers,
  ...nextAuthHandlers,
  ...verifyEmailHandlers
)

export default server
