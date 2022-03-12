import { models, model, Schema, Model, Types } from 'mongoose'
import { Categories } from '../types/common'
import err from '../utils/constants/errors'

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
