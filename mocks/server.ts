import { setupServer } from 'msw/node'
import usersHandlers from './users'
import nextAuthHandlers from './nextAuth'
import verifyEmailHandlers from './verifyEmail'

const server = setupServer(
  ...usersHandlers,
  ...nextAuthHandlers,
  ...verifyEmailHandlers
)

export default server
