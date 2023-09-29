import { IMAGES_INVALID, IMAGES_MAX } from 'constants/errors'
import Joi from 'joi'
import imageKey from 'schemas/imageKey'

const postImages = Joi.array().items(imageKey).max(5).messages({
  'array.base': IMAGES_INVALID,
  'array.max': IMAGES_MAX,
})

export default postImages
