import { setupServer } from 'msw/node'
import userHandlers from './user'
import usersIdHandlers from './users/[id]'
import nextAuthHandlers from './nextAuth'
import verifyEmailHandlers from './verifyEmail'
import postHandlers from './post'
import searchPostsHandlers from './posts/search'

const server = setupServer(
  ...userHandlers,
  ...usersIdHandlers,
  ...nextAuthHandlers,
  ...verifyEmailHandlers,
  ...postHandlers,
  ...searchPostsHandlers
)

export default server
