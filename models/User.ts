import { Document, models, model, Schema } from 'mongoose'

export interface User extends Document {
  email: string
  password: string
}

const userSchema = new Schema<User>({
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

export default models.User || model<User>('User', userSchema)
