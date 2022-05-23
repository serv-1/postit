import Joi from 'joi'
import err from '../utils/constants/errors'

const nameSchema = Joi.string()
  .pattern(/\p{Extended_Pictographic}/u, { invert: true })
  .max(90)
  .trim()
  .messages({
    'string.base': err.NAME_INVALID,
    'string.empty': err.NAME_REQUIRED,
    'string.pattern.invert.base': err.NAME_INVALID,
    'string.max': err.NAME_MAX,
    'any.required': err.NAME_REQUIRED,
  })

export default nameSchema
