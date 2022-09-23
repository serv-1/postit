import Joi from 'joi'
import err from '../utils/constants/errors'
import keySchema from './keySchema'

const imagesSchema = Joi.array()
  .items(
    keySchema.messages({
      'string.base': err.IMAGE_INVALID,
      'string.empty': err.IMAGE_REQUIRED,
      'string.max': err.IMAGE_INVALID,
    })
  )
  .max(5)
  .messages({
    'array.base': err.IMAGES_INVALID,
    'array.min': err.IMAGES_REQUIRED,
    'array.max': err.IMAGES_MAX,
    'any.required': err.IMAGES_REQUIRED,
  })

export default imagesSchema
