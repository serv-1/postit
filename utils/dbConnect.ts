import { connect, connection } from 'mongoose'
import { MONGODB_URI } from './env'

const dbConnect = async () => {
  if (connection.readyState === 1) return connection

  await connect(MONGODB_URI)

  return connection
}

export default dbConnect
