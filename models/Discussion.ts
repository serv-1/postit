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
import { fieldEncryption } from 'mongoose-field-encryption'
import cyConfig from '../cypress.json'
import Post from './Post'
import User from './User'

interface MessageModel {
  message: string
  createdAt: Date
  isBuyerMsg: Boolean
}

const messageSchema = new Schema<MessageModel>({
  message: String,
  createdAt: Date,
  isBuyerMsg: Boolean,
})

messageSchema.plugin(fieldEncryption, {
  fields: ['message'],
  secret: cyConfig.env.secret,
})

export interface DiscussionModel {
  _id: Types.ObjectId
  messages: MessageModel[]
  postId: Types.ObjectId
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
  channelName: String,
})

discussionSchema.pre<HydratedDocument<DiscussionModel>>(
  'save',
  async function () {
    await Post.findByIdAndUpdate(this.postId, {
      $push: { discussionsIds: this._id },
    })
      .lean()
      .exec()

    await User.findByIdAndUpdate(this.buyerId, {
      $push: { discussionsIds: this._id },
    })
      .lean()
      .exec()

    await User.findByIdAndUpdate(this.sellerId, {
      $push: { discussionsIds: this._id },
    })
      .lean()
      .exec()
  }
)

discussionSchema.pre<Query<DeleteResult, DiscussionModel>>(
  'deleteOne',
  async function () {
    const id = this.getFilter()._id
    const discussion = await Discussion.findById(id).lean().exec()

    await Post.findByIdAndUpdate(
      (discussion as NonNullable<typeof discussion>).postId,
      { $pull: { discussionsIds: id } }
    )
  }
)

const Discussion =
  (models.Discussion as Model<DiscussionModel>) ||
  model<DiscussionModel>('Discussion', discussionSchema)

export default Discussion
