import Joi from 'joi'
import err from '../../utils/constants/errors'
import object from './object'

const imageSchema = object({
  base64Uri: Joi.string().required().messages({
    'string.base': err.IMAGE_INVALID,
    'string.empty': err.IMAGE_REQUIRED,
    'any.required': err.IMAGE_REQUIRED,
  }),
  type: Joi.string()
    .required()
    .valid('image/jpeg', 'image/png', 'image/gif')
    .messages({
      'string.base': err.IMAGE_INVALID,
      'string.empty': err.IMAGE_REQUIRED,
      'any.required': err.IMAGE_REQUIRED,
      'any.only': err.IMAGE_INVALID,
    }),
})

export default imageSchema
