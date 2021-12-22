import { Document, models, model, Schema, Model } from 'mongoose'
import {
  EMAIL_REQUIRED,
  NAME_MAX,
  NAME_REQUIRED,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from '../utils/errors'

export interface User extends Document {
  name: string
  email: string
  password?: string
  emailVerified?: Date
}

const userSchema = new Schema<User>({
  name: {
    type: String,
    required: [true, NAME_REQUIRED],
    maxLength: [90, NAME_MAX],
  },
  email: {
    type: String,
    required: [true, EMAIL_REQUIRED],
    unique: true,
  },
  password: {
    type: String,
    min: [10, PASSWORD_MIN],
    max: [20, PASSWORD_MAX],
  },
  emailVerified: Date,
})

export default (models.User as Model<User>) || model<User>('User', userSchema)
