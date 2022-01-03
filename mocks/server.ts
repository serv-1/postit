import { setupServer } from 'msw/node'
import usersHandlers from './users'
import usersIdHandlers from './users/[id]'
import nextAuthHandlers from './nextAuth'
import verifyEmailHandlers from './verifyEmail'

const server = setupServer(
  ...usersHandlers,
  ...usersIdHandlers,
  ...nextAuthHandlers,
  ...verifyEmailHandlers
)

export default server
