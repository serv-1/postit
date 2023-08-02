import { connect, connection } from 'mongoose'
import env from 'utils/constants/env'

const dbConnect = async () => {
  if (connection.readyState === 1) return connection

  await connect(env.MONGO_URI)

  return connection
}

export default dbConnect
