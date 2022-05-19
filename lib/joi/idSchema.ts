import Joi from 'joi'
import err from '../../utils/constants/errors'

export const idSchema = Joi.string().required().length(24).hex().messages({
  'string.base': err.ID_INVALID,
  'string.length': err.ID_INVALID,
  'string.hex': err.ID_INVALID,
  'any.required': err.ID_INVALID,
})
