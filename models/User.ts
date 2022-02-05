import { models, model, Schema, Model, Types } from 'mongoose'
import err from '../utils/constants/errors'

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  password?: string
  emailVerified?: Date
  image: string
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, err.NAME_REQUIRED],
    maxLength: [90, err.NAME_MAX],
  },
  email: {
    type: String,
    required: [true, err.EMAIL_REQUIRED],
    unique: true,
  },
  password: {
    type: String,
    min: [10, err.PASSWORD_MIN],
    max: [20, err.PASSWORD_MAX],
  },
  emailVerified: Date,
  image: {
    type: String,
    default: '/static/images/default.jpg',
  },
})

export default (models.User as Model<IUser>) || model<IUser>('User', userSchema)
