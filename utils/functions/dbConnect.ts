import { connect, connection } from 'mongoose'
import env from '../constants/env'

/**
 * Connect to mongoDB and return the connection or directly return
 * the already opened connection.
 */
const dbConnect = async () => {
  if (connection.readyState === 1) return connection

  await connect(env.MONGODB_URI)

  return connection
}

export default dbConnect
