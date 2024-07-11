import type { DeleteResult } from 'mongodb'
import { models, model, Schema, type Model, Types, Query } from 'mongoose'
import { nanoid } from 'nanoid'
import Post from 'models/Post'
import User from 'models/User'

export interface MessageDoc {
  _id: Types.ObjectId
  message: string
  createdAt: Date
  userId?: Types.ObjectId
  seen: boolean
}

const messageSchema = new Schema<MessageDoc>({
  message: String,
  createdAt: { type: Date, default: Date.now },
  userId: Schema.Types.ObjectId,
  seen: { type: Boolean, default: false },
})

export interface DiscussionDoc {
  _id: Types.ObjectId
  messages: MessageDoc[]
  postId?: Types.ObjectId
  buyerId?: Types.ObjectId
  sellerId?: Types.ObjectId
  postName: string
  channelName: string
}

const discussionSchema = new Schema<DiscussionDoc>({
  messages: [messageSchema],
  postId: Schema.Types.ObjectId,
  buyerId: Schema.Types.ObjectId,
  sellerId: Schema.Types.ObjectId,
  postName: String,
  channelName: {
    type: String,
    default: () => 'private-encrypted-' + nanoid(),
  },
})

discussionSchema.pre('save', async function () {
  await Post.updateOne(
    { _id: this.postId },
    { $push: { discussionIds: this._id } }
  )
    .lean()
    .exec()

  await User.updateOne(
    { _id: this.buyerId },
    { $push: { discussions: { id: this._id } } }
  )
    .lean()
    .exec()

  await User.updateOne(
    { _id: this.sellerId },
    { $push: { discussions: { id: this._id, hasNewMessage: true } } }
  )
    .lean()
    .exec()
})

discussionSchema.pre<Query<DeleteResult, DiscussionDoc>>(
  'deleteOne',
  async function () {
    const discussionId = this.getFilter()._id
    const discussion = (await Discussion.findById(discussionId).lean().exec())!

    await Post.updateOne(
      { _id: discussion.postId },
      { $pull: { discussionIds: discussionId } }
    )

    if (discussion.buyerId) {
      await User.updateOne(
        { _id: discussion.buyerId },
        { $pull: { discussions: { id: discussionId } } }
      )
    }

    if (discussion.sellerId) {
      await User.updateOne(
        { _id: discussion.sellerId },
        { $pull: { discussions: { id: discussionId } } }
      )
    }
  }
)

const Discussion =
  (models.Discussion as Model<DiscussionDoc>) ||
  model('Discussion', discussionSchema)

export default Discussion
