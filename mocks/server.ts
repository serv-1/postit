import { setupServer } from 'msw/node'
import userHandlers from './user'
import usersIdHandlers from './users/[id]'
import nextAuthHandlers from './nextAuth'
import verifyEmailHandlers from './verifyEmail'
import postsIdHandlers from './posts/[id]'
import autoCompleteHandlers from './locationiq/autocomplete'
import discussionsIdHandlers from './discussions/[id]'
import s3Handlers from './s3'

const server = setupServer(
  ...userHandlers,
  ...usersIdHandlers,
  ...nextAuthHandlers,
  ...verifyEmailHandlers,
  ...postsIdHandlers,
  ...autoCompleteHandlers,
  ...discussionsIdHandlers,
  ...s3Handlers
)

export default server
