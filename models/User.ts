import mongoose from 'mongoose'

type User = {
  email: string
  password: string
}

const userSchema = new mongoose.Schema<User>({
  email: {
    type: String,
    required: [true, 'The email is required.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'The password is required.'],
  },
})

export default mongoose.models.User || mongoose.model<User>('User', userSchema)
