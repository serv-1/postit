import { setupServer } from 'msw/node'
import userHandlers from './user'
import usersIdHandlers from './users/[id]'
import nextAuthHandlers from './nextAuth'
import verifyEmailHandlers from './verifyEmail'
import postHandlers from './post'
import postsIdHandlers from './posts/[id]'
import searchPostsHandlers from './posts/search'
import autoCompleteHandlers from './locationiq/autocomplete'
import searchHandlers from './locationiq/search'

const server = setupServer(
  ...userHandlers,
  ...usersIdHandlers,
  ...nextAuthHandlers,
  ...verifyEmailHandlers,
  ...postHandlers,
  ...postsIdHandlers,
  ...searchPostsHandlers,
  ...autoCompleteHandlers,
  ...searchHandlers
)

export default server
