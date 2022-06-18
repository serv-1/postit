import { DeleteResult } from 'mongodb'
import { models, model, Schema, Model, Types, Query } from 'mongoose'
import { Categories } from '../types/common'
import err from '../utils/constants/errors'
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
}

const postSchema = new Schema<PostModel, Model<PostModel>, PostModel>({
  name: {
    type: String,
    required: [true, err.NAME_REQUIRED],
    maxLength: [90, err.NAME_MAX],
  },
  description: {
    type: String,
    required: [true, err.DESCRIPTION_REQUIRED],
    minLength: [10, err.DESCRIPTION_MIN],
    maxLength: [300, err.DESCRIPTION_MAX],
  },
  categories: {
    type: [String],
    required: [true, err.CATEGORIES_REQUIRED],
    validate: [
      validateCategories,
      'At least one category is required. (10 maximum)',
    ],
  },
  price: {
    type: Number,
    min: [1, err.PRICE_REQUIRED],
  },
  images: {
    type: [String],
    validate: [validateImages, 'At least one image is required. (5 maximum)'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  address: {
    type: String,
    required: [true, err.ADDRESS_REQUIRED],
  },
  latLon: {
    type: [Number],
    required: [true, err.LATLON_REQUIRED],
  },
})

postSchema.pre('save', async function () {
  const update = { $push: { postsIds: this._id } }
  await User.updateOne({ _id: this.userId }, update).lean().exec()
})

postSchema.post('insertMany', async function (posts) {
  for (const post of posts as PostModel[]) {
    const update = { $push: { postsIds: post._id } }
    await User.updateOne({ _id: post.userId }, update).lean().exec()
  }
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
})

export default (models.Post as Model<PostModel>) ||
  model<PostModel>('Post', postSchema)

function validateCategories(value: string[]) {
  if (value.length < 1) return false
  else if (value.length > 10) return false
  return true
}

function validateImages(value: string[]) {
  if (value.length < 1) return false
  else if (value.length > 5) return false
  return true
}
