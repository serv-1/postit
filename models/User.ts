import { models, model, Schema, Model, Types } from 'mongoose'
import err from '../utils/constants/errors'

export interface UserModel {
  _id: Types.ObjectId
  name: string
  email: string
  password?: string
  emailVerified?: Date
  postsIds: Types.ObjectId[]
  image: string
}

const userSchema = new Schema<UserModel>({
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
  postsIds: [Schema.Types.ObjectId],
  image: {
    type: String,
    default: 'default.jpg',
  },
})

export default (models.User as Model<UserModel>) ||
  model<UserModel>('User', userSchema)
