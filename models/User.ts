import { randomBytes, scryptSync } from 'crypto'
import { DeleteResult } from 'mongodb'
import { models, model, Schema, Model, Types, Query } from 'mongoose'
import Account from './Account'
import Discussion from './Discussion'
import Post from './Post'

export interface UserModel {
  _id: Types.ObjectId
  name: string
  email: string
  image: string
  password?: string
  emailVerified?: Date
  postsIds: Types.ObjectId[]
  favPostsIds: Types.ObjectId[]
  discussionsIds: Types.ObjectId[]
}

const userSchema = new Schema<UserModel>({
  name: String,
  email: { type: String, unique: true },
  image: { type: String, default: 'default.jpg' },
  password: String,
  emailVerified: Date,
  postsIds: [Schema.Types.ObjectId],
  favPostsIds: [Schema.Types.ObjectId],
  discussionsIds: [Schema.Types.ObjectId],
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

  const user = await User.findById(userId).lean().exec()

  for (const id of (user as NonNullable<typeof user>).discussionsIds) {
    const discussion = await Discussion.findById(id).exec()
    const disc = discussion as NonNullable<typeof discussion>

    const buyerId = disc.buyerId?.toString()
    const sellerId = disc.sellerId?.toString()

    const otherUserId = buyerId === userId ? sellerId : buyerId
    const otherUser = await User.findById(otherUserId).lean().exec()
    const discussionsIds = otherUser?.discussionsIds.map((id) => id.toString())

    if (!discussionsIds?.includes(id.toString())) {
      await Discussion.deleteOne({ _id: id }).lean().exec()
    } else {
      disc[buyerId === userId ? 'buyerId' : 'sellerId'] = undefined
      await disc.save()
    }
  }
})

const User =
  (models.User as Model<UserModel>) || model<UserModel>('User', userSchema)

export default User
