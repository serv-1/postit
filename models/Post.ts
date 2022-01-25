import { models, model, Schema, Model, Types } from 'mongoose'
import err from '../utils/constants/errors'

interface IImage {
  base64Uri: string
  type: 'image/jpeg' | 'image/png' | 'image/gif'
}

const imageSchema = new Schema<IImage>({
  base64Uri: {
    type: String,
    required: [true, err.IMAGE_INVALID],
  },
  type: {
    type: String,
    required: [true, err.IMAGE_INVALID],
    enum: {
      values: ['image/jpeg', 'image/png', 'image/gif'],
      message: err.IMAGE_INVALID,
    },
  },
})

export interface IPost {
  name: string
  description: string
  categories: string[]
  price: number
  images: IImage[]
  userId: Types.ObjectId
}

const postSchema = new Schema<IPost>({
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
    type: [imageSchema],
    validate: [validateImages, 'At least one image is required. (5 maximum)'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
})

export default (models.Post as Model<IPost>) || model<IPost>('Post', postSchema)

function validateCategories(value: string[]) {
  if (value.length < 1) return false
  else if (value.length > 10) return false
  return true
}

function validateImages(value: IImage[]) {
  if (value.length < 1) return false
  else if (value.length > 5) return false
  return true
}
