import { DeleteResult } from 'mongodb'
import {
  models,
  model,
  Schema,
  Model,
  Types,
  Query,
  UpdateWriteOpResult,
} from 'mongoose'
import { Categories } from 'types/common'
import deleteImage from 'utils/functions/deleteImage'
import Discussion from 'models/Discussion'
import User from 'models/User'

export interface PostDoc {
  _id: Types.ObjectId
  name: string
  description: string
  categories: Categories[]
  price: number
  images: string[]
  userId: Types.ObjectId
  address: string
  latLon: number[]
  discussionIds: Types.ObjectId[]
}

const postSchema = new Schema<PostDoc>({
  name: String,
  description: String,
  categories: [String],
  price: Number,
  images: [String],
  userId: Schema.Types.ObjectId,
  address: String,
  latLon: [Number],
  discussionIds: [Schema.Types.ObjectId],
})

postSchema.pre('save', async function () {
  await User.updateOne({ _id: this.userId }, { $push: { postIds: this._id } })
    .lean()
    .exec()
})

postSchema.pre<Query<DeleteResult, PostDoc>>('deleteOne', async function () {
  const postId = this.getFilter()._id
  const post = (await Post.findById(postId).lean().exec()) as PostDoc

  await User.updateOne({ _id: post.userId }, { $pull: { postIds: postId } })
    .lean()
    .exec()

  await User.updateMany(
    { favPostIds: { $all: [postId] } },
    { $pull: { favPostIds: postId } }
  )
    .lean()
    .exec()

  const promises: Promise<void | UpdateWriteOpResult>[] = []

  for (const image of post.images) {
    promises.push(deleteImage(image))
  }

  for (const discussionId of post.discussionIds) {
    promises.push(
      Discussion.updateOne(
        { _id: discussionId },
        { $unset: { postId: '' } },
        { omitUndefined: true }
      )
        .lean()
        .exec()
    )
  }

  await Promise.all(promises)
})

const Post = (models.Post as Model<PostDoc>) || model('Post', postSchema)

export default Post
