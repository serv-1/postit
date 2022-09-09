import { DeleteResult } from 'mongodb'
import {
  models,
  model,
  Schema,
  Model,
  Types,
  Query,
  HydratedDocument,
} from 'mongoose'
import { Categories } from '../types/common'
import Discussion from './Discussion'
import User from './User'

export interface PostModel {
  _id: Types.ObjectId
  name: string
  description: string
  categories: Categories[]
  price: number
  images: string[]
  userId: Types.ObjectId
  address: string
  latLon: number[]
  discussionsIds: Types.ObjectId[]
}

const postSchema = new Schema<PostModel>({
  name: String,
  description: String,
  categories: [String],
  price: Number,
  images: [String],
  userId: Schema.Types.ObjectId,
  address: String,
  latLon: [Number],
  discussionsIds: [Schema.Types.ObjectId],
})

postSchema.pre<HydratedDocument<PostModel>>('save', async function () {
  const update = { $push: { postsIds: this._id } }
  await User.updateOne({ _id: this.userId }, update).lean().exec()
})

postSchema.pre<Query<DeleteResult, PostModel>>('deleteOne', async function () {
  const id = this.getFilter()._id

  await User.updateOne(
    { postsIds: { $all: [id] } },
    { $pull: { postsIds: id } }
  )
    .lean()
    .exec()

  await User.updateMany(
    { favPostsIds: { $all: [id] } },
    { $pull: { favPostsIds: id } }
  )
    .lean()
    .exec()

  const post = (await Post.findById(id).lean().exec()) as PostModel

  for (const id of post.discussionsIds) {
    await Discussion.updateOne(
      { _id: id },
      { $unset: { postId: '' } },
      { omitUndefined: true }
    )
      .lean()
      .exec()
  }
})

const Post =
  (models.Post as Model<PostModel>) || model<PostModel>('Post', postSchema)

export default Post
