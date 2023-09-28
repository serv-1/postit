import Joi from 'joi'
import imageKey from 'schemas/imageKey'
import err from 'utils/constants/errors'

const postImages = Joi.array().items(imageKey).max(5).messages({
  'array.base': err.IMAGES_INVALID,
  'array.max': err.IMAGES_MAX,
})

export default postImages
