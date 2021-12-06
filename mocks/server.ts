import { setupServer } from 'msw/node'
import usersHandlers from './users'
import nextAuthHandlers from './nextAuth'

const server = setupServer(...usersHandlers, ...nextAuthHandlers)

export default server
