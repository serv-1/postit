import { type DeleteResult } from 'mongodb'
import { models, model, Schema, type Model, Types, Query } from 'mongoose'
import { nanoid } from 'nanoid'
import deleteImage from 'functions/deleteImage'
import Account from 'models/Account'
import Discussion from 'models/Discussion'
import Post from 'models/Post'
import hashPassword from 'functions/hashPassword'

export interface UserDiscussionDoc {
  id: Types.ObjectId
  hidden: boolean
  hasNewMessage: boolean
}

export interface UserDoc {
  _id: Types.ObjectId
  name: string
  email: string
  image?: string
  password?: string
  emailVerified?: Date
  postIds: Types.ObjectId[]
  favPostIds: Types.ObjectId[]
  discussions: UserDiscussionDoc[]
  channelName: string
}

const userDiscussionSchema = new Schema<UserDiscussionDoc>({
  id: Schema.Types.ObjectId,
  hidden: { type: Boolean, default: false },
  hasNewMessage: { type: Boolean, default: false },
})

const userSchema = new Schema<UserDoc>({
  name: String,
  email: { type: String, unique: true },
  image: String,
  password: String,
  emailVerified: Date,
  postIds: [Schema.Types.ObjectId],
  favPostIds: [Schema.Types.ObjectId],
  discussions: [userDiscussionSchema],
  channelName: {
    type: String,
    default: () => 'private-encrypted-' + nanoid(),
  },
})

userSchema.pre('save', function (next) {
  this.password = hashPassword(this.password!)
  next()
})

userSchema.pre<Query<DeleteResult, UserDoc>>('deleteOne', async function () {
  const userId = this.getFilter()._id.toString()

  await Account.deleteOne({ userId }).lean().exec()

  const user = (await User.findById(userId).lean().exec())!

  if (user.image) {
    await deleteImage(user.image)
  }

  const postDeletions = user.postIds.map((postId) => {
    return Post.deleteOne({ _id: postId }).lean().exec()
  })

  await Promise.all(postDeletions)

  for (const discussion of user.discussions) {
    const { buyerId, sellerId } = (await Discussion.findById(discussion.id)
      .lean()
      .exec())!

    if (!buyerId || !sellerId) {
      await Discussion.deleteOne({ _id: discussion.id }).lean().exec()

      continue
    }

    const isBuyer = userId === buyerId.toString()

    const interlocutor = (await User.findById(isBuyer ? sellerId : buyerId)
      .lean()
      .exec())!

    const { hidden } = interlocutor.discussions.find(
      (d) => d.id.toString() === discussion.id.toString()
    )!

    if (hidden) {
      await Discussion.deleteOne({ _id: discussion.id }).lean().exec()
    } else {
      await Discussion.updateOne(
        { _id: discussion.id },
        { $unset: { [isBuyer ? 'buyerId' : 'sellerId']: '' } },
        { omitUndefined: true }
      )
        .lean()
        .exec()
    }
  }
})

const User = (models.User as Model<UserDoc>) || model('User', userSchema)

export default User
