import { DeleteResult } from 'mongodb'
import {
  models,
  model,
  Schema,
  Model,
  Types,
  HydratedDocument,
  Query,
} from 'mongoose'
import { nanoid } from 'nanoid'
import Post from './Post'
import User, { UserModel } from './User'

export interface MessageModel {
  message: string
  createdAt: Date
  userId: Types.ObjectId
  seen: boolean
}

const messageSchema = new Schema<MessageModel>({
  message: String,
  createdAt: { type: Date, default: Date.now },
  userId: Schema.Types.ObjectId,
  seen: { type: Boolean, default: false },
})

export interface DiscussionModel {
  _id: Types.ObjectId
  messages: MessageModel[]
  postId?: Types.ObjectId
  buyerId?: Types.ObjectId
  sellerId?: Types.ObjectId
  postName: string
  channelName: string
}

const discussionSchema = new Schema<DiscussionModel>({
  messages: [messageSchema],
  postId: Schema.Types.ObjectId,
  buyerId: Schema.Types.ObjectId,
  sellerId: Schema.Types.ObjectId,
  postName: String,
  channelName: { type: String, default: () => nanoid() },
})

discussionSchema.pre<HydratedDocument<DiscussionModel>>(
  'save',
  async function () {
    await Post.updateOne(
      { _id: this.postId },
      { $push: { discussionsIds: this._id } }
    )
      .lean()
      .exec()

    await User.updateOne(
      { _id: this.buyerId },
      { $push: { discussionsIds: this._id } }
    )
      .lean()
      .exec()

    await User.updateOne(
      { _id: this.sellerId },
      { $push: { discussionsIds: this._id }, hasUnseenMessages: true }
    )
      .lean()
      .exec()
  }
)

discussionSchema.pre<Query<DeleteResult, DiscussionModel>>(
  'deleteOne',
  async function () {
    const id = this.getFilter()._id

    const discussion = (await Discussion.findById(id)
      .lean()
      .exec()) as DiscussionModel

    await Post.updateOne(
      { _id: discussion.postId },
      { $pull: { discussionsIds: id } }
    )

    const lastMsg = discussion.messages[discussion.messages.length - 1]

    await User.updateOne(
      { _id: lastMsg.userId },
      { $pull: { discussionsIds: id } }
    )

    const userId =
      lastMsg.userId.toString() === discussion.buyerId?.toString()
        ? discussion.sellerId
        : discussion.buyerId

    if (!userId) return

    if (!lastMsg.seen) {
      const user = (await User.findById(userId).lean().exec()) as UserModel

      const discussionsIds = user.discussionsIds.filter(
        (i) => i.toString() !== id.toString()
      )

      for (const discussionId of discussionsIds) {
        const discussion = (await Discussion.findById(discussionId)
          .lean()
          .exec()) as DiscussionModel

        const lastMsg = discussion.messages[discussion.messages.length - 1]

        if (
          lastMsg.userId.toString() !== user._id.toString() &&
          !lastMsg.seen
        ) {
          await User.updateOne(
            { _id: user._id },
            { $pull: { discussionsIds: id } }
          )
          return
        }
      }

      await User.updateOne(
        { _id: user._id },
        { $pull: { discussionsIds: id }, hasUnseenMessages: false }
      )
    } else {
      await User.updateOne({ _id: userId }, { $pull: { discussionsIds: id } })
    }
  }
)

const Discussion =
  (models.Discussion as Model<DiscussionModel>) ||
  model<DiscussionModel>('Discussion', discussionSchema)

export default Discussion
