import Joi from 'joi'
import err from '../utils/constants/errors'

const imagesFileListSchema = Joi.object().max(5).messages({
  'object.base': err.IMAGES_INVALID,
  'any.required': err.IMAGES_REQUIRED,
  'object.min': err.IMAGES_REQUIRED,
  'object.max': err.IMAGES_MAX,
})

export default imagesFileListSchema
