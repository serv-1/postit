import type { DeleteResult } from 'mongodb'
import { models, model, Schema, type Model, Types, Query } from 'mongoose'
import { nanoid } from 'nanoid'
import Post from 'models/Post'
import User, { type UserDoc } from 'models/User'

export interface MessageDoc {
  message: string
  createdAt: Date
  userId: Types.ObjectId
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
  channelName: { type: String, default: () => nanoid() },
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
    { $push: { discussionIds: this._id } }
  )
    .lean()
    .exec()

  await User.updateOne(
    { _id: this.sellerId },
    { $push: { discussionIds: this._id }, hasUnseenMessages: true }
  )
    .lean()
    .exec()
})

discussionSchema.pre<Query<DeleteResult, DiscussionDoc>>(
  'deleteOne',
  async function () {
    const discussionId = this.getFilter()._id
    const discussion = (await Discussion.findById(discussionId)
      .lean()
      .exec()) as DiscussionDoc

    await Post.updateOne(
      { _id: discussion.postId },
      { $pull: { discussionIds: discussionId } }
    )

    const lastMsg = discussion.messages[discussion.messages.length - 1]

    /**
     * We don't need to deal with "hasUnseenMessages" with the author of the
     * last message because he has inevitably seen it.
     */
    await User.updateOne(
      { _id: lastMsg.userId },
      { $pull: { discussionIds: discussionId } }
    )

    const userId =
      lastMsg.userId.toString() === discussion.buyerId?.toString()
        ? discussion.sellerId
        : discussion.buyerId

    if (!userId) return

    if (!lastMsg.seen) {
      const user = (await User.findById(userId).lean().exec()) as UserDoc

      let hasUnseenMessages = false

      for (const id of user.discussionIds) {
        if (id.toString() === discussionId.toString()) {
          continue
        }

        const { messages } = (await Discussion.findById(id)
          .lean()
          .exec()) as DiscussionDoc
        const { userId, seen } = messages[messages.length - 1]

        if (userId.toString() !== user._id.toString() && !seen) {
          hasUnseenMessages = true

          break
        }
      }

      if (!hasUnseenMessages) {
        await User.updateOne(
          { _id: user._id },
          { $pull: { discussionIds: discussionId }, hasUnseenMessages }
        )

        return
      }
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { discussionIds: discussionId } }
    )
  }
)

const Discussion =
  (models.Discussion as Model<DiscussionDoc>) ||
  model('Discussion', discussionSchema)

export default Discussion
