import { connect, connection } from 'mongoose'

const dbConnect = async () => {
  if (connection.readyState === 1) return connection

  await connect(
    `mongodb+srv://serv-1:7p1KlewcQLzCr2Us@cluster0.trffm.mongodb.net/FilanadDev?retryWrites=true&w=majority`
  )

  return connection
}

export default dbConnect
