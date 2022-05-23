import Joi from 'joi'
import err from '../utils/constants/errors'

const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .trim()
  .messages({
    'string.base': err.EMAIL_INVALID,
    'string.empty': err.EMAIL_REQUIRED,
    'string.email': err.EMAIL_INVALID,
    'any.required': err.EMAIL_REQUIRED,
  })

export default emailSchema
