import { models, model, Schema, Model, Types } from 'mongoose'
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
}

const postSchema = new Schema<PostModel>({
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
})

postSchema.pre('save', async function (next) {
  const update = { $push: { postsIds: this._id } }
  await User.updateOne({ _id: this.userId }, update).lean().exec()
  next()
})

postSchema.post('insertMany', async function (posts, next) {
  for (const post of posts) {
    const update = { $push: { postsIds: post._id } }
    await User.updateOne({ _id: post.userId }, update).lean().exec()
  }
  next()
})

postSchema.post('deleteOne', async function (res, next) {
  const id = this.getFilter()._id

  User.updateOne(
    { postsIds: { $all: [id] } },
    { $pull: { postsIds: id } }
  ).exec()

  next()
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
