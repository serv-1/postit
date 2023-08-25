import { connect, connection } from 'mongoose'
import env from 'utils/constants/env'

export default async function dbConnect() {
  if (connection.readyState === 1) return connection

  await connect(env.MONGO_URI)

  return connection
}
