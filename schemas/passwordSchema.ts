import Joi from 'joi'
import err from '../utils/constants/errors'

const passwordSchema = Joi.string().min(10).max(20).trim().messages({
  'string.base': err.PASSWORD_INVALID,
  'string.empty': err.PASSWORD_REQUIRED,
  'any.invalid': err.PASSWORD_SAME,
  'string.min': err.PASSWORD_MIN,
  'string.max': err.PASSWORD_MAX,
  'any.required': err.PASSWORD_REQUIRED,
})

export default passwordSchema
