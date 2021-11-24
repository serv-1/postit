import { setupServer } from 'msw/node'
import usersHandlers from './users'

const server = setupServer(...usersHandlers)

export default server
