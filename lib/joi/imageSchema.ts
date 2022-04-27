import Joi from 'joi'
import err from '../../utils/constants/errors'
import object from './object'

export const imageSchema = object({
  base64: Joi.string().base64().required().messages({
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
