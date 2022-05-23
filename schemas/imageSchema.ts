import Joi from 'joi'
import err from '../utils/constants/errors'

const imageSchema = Joi.object({
  base64: Joi.string().required().base64().messages({
    'string.base': err.IMAGE_INVALID,
    'string.empty': err.IMAGE_REQUIRED,
    'string.base64': err.IMAGE_INVALID,
    'any.required': err.IMAGE_REQUIRED,
  }),
  ext: Joi.string().required().valid('jpg', 'jpeg', 'png', 'gif').messages({
    'string.base': err.IMAGE_INVALID,
    'string.empty': err.IMAGE_REQUIRED,
    'any.required': err.IMAGE_REQUIRED,
    'any.only': err.IMAGE_INVALID,
  }),
})
  .unknown(false)
  .messages({
    'object.base': err.IMAGE_INVALID,
    'object.unknown': err.IMAGE_INVALID,
  })

export default imageSchema
