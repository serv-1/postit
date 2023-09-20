import { type DeleteResult } from 'mongodb'
import { models, model, Schema, type Model, Types, Query } from 'mongoose'
import { nanoid } from 'nanoid'
import deleteImage from 'utils/functions/deleteImage'
import Account from 'models/Account'
import Discussion, { type DiscussionDoc } from 'models/Discussion'
import Post from 'models/Post'
import hashPassword from 'utils/functions/hashPassword'

export interface UserDoc {
  _id: Types.ObjectId
  name: string
  email: string
  image?: string
  password?: string
  emailVerified?: Date
  postIds: Types.ObjectId[]
  favPostIds: Types.ObjectId[]
  discussionIds: Types.ObjectId[]
  channelName: string
  hasUnseenMessages: boolean
}

const userSchema = new Schema<UserDoc>({
  name: String,
  email: { type: String, unique: true },
  image: { type: String },
  password: String,
  emailVerified: Date,
  postIds: [Schema.Types.ObjectId],
  favPostIds: [Schema.Types.ObjectId],
  discussionIds: [Schema.Types.ObjectId],
  channelName: { type: String, default: () => nanoid() },
  hasUnseenMessages: { type: Boolean, default: false },
})

userSchema.pre('save', function (next) {
  this.password = hashPassword(this.password as string)
  next()
})

userSchema.pre<Query<DeleteResult, UserDoc>>('deleteOne', async function () {
  const userId = this.getFilter()._id.toString()

  await Account.deleteOne({ userId }).lean().exec()

  const user = (await User.findById(userId).lean().exec()) as UserDoc

  if (user.image) {
    await deleteImage(user.image)
  }

  const postDeletions = user.postIds.map((postId) => {
    return Post.deleteOne({ _id: postId }).lean().exec()
  })

  await Promise.all(postDeletions)

  for (const discussionId of user.discussionIds) {
    const { buyerId, sellerId } = (await Discussion.findById(discussionId)
      .lean()
      .exec()) as DiscussionDoc

    let hasDiscussionBeenUpdated = false

    if (buyerId && sellerId) {
      const isBuyer = buyerId?.toString() === userId
      const { discussionIds } = (await User.findById(
        isBuyer ? sellerId : buyerId
      )
        .lean()
        .exec()) as UserDoc

      for (const id of discussionIds) {
        if (id.toString() === discussionId.toString()) {
          await Discussion.updateOne(
            { _id: discussionId },
            { $unset: { [isBuyer ? 'buyerId' : 'sellerId']: '' } },
            { omitUndefined: true }
          )
            .lean()
            .exec()

          hasDiscussionBeenUpdated = true

          break
        }
      }
    }

    if (!hasDiscussionBeenUpdated) {
      await Discussion.deleteOne({ _id: discussionId }).lean().exec()
    }
  }
})

const User = (models.User as Model<UserDoc>) || model('User', userSchema)

export default User
