import { randomBytes, scryptSync } from 'crypto'
import { models, model, Schema, Model, Types } from 'mongoose'
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

type ModelWithPassword = Omit<UserModel, 'password'> & { password: string }

userSchema.pre<ModelWithPassword>('save', function (next) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(this.password, salt, 64).toString('hex')

  this.password = `${salt}:${hash}`

  next()
})

userSchema.pre<Model<ModelWithPassword>>('insertMany', function (next, users) {
  for (const user of users) {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(user.password, salt, 64).toString('hex')

    user.password = `${salt}:${hash}`
  }

  next()
})

userSchema.post('deleteOne', async function (res, next) {
  const userId = this.getFilter()._id

  await Account.deleteOne({ userId }).lean().exec()
  await Post.deleteMany({ userId }).lean().exec()

  next()
})

export default (models.User as Model<UserModel>) ||
  model<UserModel>('User', userSchema)
