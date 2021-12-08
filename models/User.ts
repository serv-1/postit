import { Document, models, model, Schema } from 'mongoose'

export interface User extends Document {
  username: string
  email: string
  password: string
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: [true, 'The username is required.'],
    maxLength: [90, 'The username cannot exceed 90 characters.'],
  },
  email: {
    type: String,
    required: [true, 'The email is required.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'The password is required.'],
    min: [10, 'The password must have 10 characters.'],
    max: [20, 'The password cannot exceed 20 characters.'],
  },
})

export default models.User || model<User>('User', userSchema)
