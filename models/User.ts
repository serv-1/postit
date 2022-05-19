import { randomBytes, scryptSync } from 'crypto'
import { DeleteResult } from 'mongodb'
import { models, model, Schema, Model, Types, Query } from 'mongoose'
import err from '../utils/constants/errors'
import Account from './Account'
import Post from './Post'

export interface UserModel {
  _id: Types.ObjectId
  name: string
  email: string
  password?: string
  emailVerified?: Date
  postsIds: Types.ObjectId[]
  favPostsIds: Types.ObjectId[]
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
  favPostsIds: [Schema.Types.ObjectId],
  image: {
    type: String,
    default: 'default.jpg',
  },
})

userSchema.pre('save', function (next) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(this.password as string, salt, 64).toString('hex')

  this.password = `${salt}:${hash}`

  next()
})

userSchema.pre<Model<UserModel>>('insertMany', function (next, users) {
  for (const user of users as UserModel[]) {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(user.password as string, salt, 64).toString('hex')

    user.password = `${salt}:${hash}`
  }

  next()
})

userSchema.pre<Query<DeleteResult, UserModel>>('deleteOne', async function () {
  const userId = this.getFilter()._id
  await Account.deleteOne({ userId }).lean().exec()
  await Post.deleteMany({ userId }).lean().exec()
})

export default (models.User as Model<UserModel>) ||
  model<UserModel>('User', userSchema)
