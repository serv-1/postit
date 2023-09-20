import { connect, connection } from 'mongoose'
import { MONGO_URI } from 'env'

export default async function dbConnect() {
  if (connection.readyState === 1) return connection

  await connect(MONGO_URI)

  return connection
}
