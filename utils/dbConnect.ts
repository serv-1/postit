import { connect, connection } from 'mongoose'

const mongoDbUri =
  'mongodb+srv://serv-1:7p1KlewcQLzCr2Us@cluster0.trffm.mongodb.net/FilanadDev?retryWrites=true&w=majority'

const dbConnect = async () => {
  if (connection.readyState === 1) return connection

  await connect(mongoDbUri)

  return connection
}

export default dbConnect
