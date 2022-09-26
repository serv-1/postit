import { randomBytes, scryptSync } from 'crypto'
import { DeleteResult } from 'mongodb'
import { models, model, Schema, Model, Types, Query } from 'mongoose'
import { nanoid } from 'nanoid'
import deleteImage from '../utils/functions/deleteImage'
import Account from './Account'
import Discussion, { DiscussionModel } from './Discussion'
import Post from './Post'

export interface UserModel {
  _id: Types.ObjectId
  name: string
  email: string
  image?: string
  password?: string
  emailVerified?: Date
  postsIds: Types.ObjectId[]
  favPostsIds: Types.ObjectId[]
  discussionsIds: Types.ObjectId[]
  channelName: string
  hasUnseenMessages: boolean
}

const userSchema = new Schema<UserModel>({
  name: String,
  email: { type: String, unique: true },
  image: { type: String },
  password: String,
  emailVerified: Date,
  postsIds: [Schema.Types.ObjectId],
  favPostsIds: [Schema.Types.ObjectId],
  discussionsIds: [Schema.Types.ObjectId],
  channelName: { type: String, default: () => nanoid() },
  hasUnseenMessages: { type: Boolean, default: false },
})

userSchema.pre('save', function (next) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(this.password as string, salt, 64).toString('hex')

  this.password = `${salt}:${hash}`

  next()
})

userSchema.pre<Query<DeleteResult, UserModel>>('deleteOne', async function () {
  const userId = this.getFilter()._id.toString()

  await Account.deleteOne({ userId }).lean().exec()

  const user = (await User.findById(userId).lean().exec()) as UserModel

  if (user.image) {
    await deleteImage(user.image)
  }

  for (const postId of user.postsIds) {
    await Post.deleteOne({ _id: postId }).lean().exec()
  }

  for (const id of user.discussionsIds) {
    const discussion = (await Discussion.findById(id).exec()) as DiscussionModel

    const buyerId = discussion.buyerId?.toString()
    const sellerId = discussion.sellerId?.toString()

    const otherUserId = buyerId === userId ? sellerId : buyerId
    const otherUser = await User.findById(otherUserId).lean().exec()
    const discussionsIds = otherUser?.discussionsIds.map((id) => id.toString())

    if (!discussionsIds?.includes(id.toString())) {
      await Discussion.deleteOne({ _id: id }).lean().exec()
    } else {
      await Discussion.updateOne(
        { _id: discussion._id },
        { $unset: { [buyerId === userId ? 'buyerId' : 'sellerId']: '' } },
        { omitUndefined: true }
      )
        .lean()
        .exec()
    }
  }
})

const User =
  (models.User as Model<UserModel>) || model<UserModel>('User', userSchema)

export default User
