import { NAME_INVALID, NAME_REQUIRED, NAME_MAX } from 'constants/errors'
import Joi from 'joi'

const name = Joi.string()
  .pattern(/\p{Extended_Pictographic}/u, { invert: true })
  .max(90)
  .trim()
  .messages({
    'string.base': NAME_INVALID,
    'string.empty': NAME_REQUIRED,
    'string.pattern.invert.base': NAME_INVALID,
    'string.max': NAME_MAX,
  })

export default name
