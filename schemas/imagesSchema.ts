import Joi from 'joi'
import err from '../utils/constants/errors'
import imageSchema from './imageSchema'

const imagesSchema = Joi.array().items(imageSchema).max(5).messages({
  'array.base': err.IMAGES_INVALID,
  'array.min': err.IMAGES_REQUIRED,
  'array.max': err.IMAGES_MAX,
  'any.required': err.IMAGES_REQUIRED,
})

export default imagesSchema
