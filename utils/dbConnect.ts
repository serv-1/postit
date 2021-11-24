import mongoose from 'mongoose'

const dbConnect = async () => {
  if (mongoose.connection.readyState === 1) return

  try {
    await mongoose.connect(
      `mongodb+srv://serv-1:7p1KlewcQLzCr2Us@cluster0.trffm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    )
  } catch (e) {
    throw e
  }
}

export default dbConnect
