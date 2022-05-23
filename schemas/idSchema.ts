import Joi from 'joi'
import err from '../utils/constants/errors'

const idSchema = Joi.string().length(24).hex().messages({
  'string.base': err.ID_INVALID,
  'string.empty': err.ID_INVALID,
  'string.length': err.ID_INVALID,
  'string.hex': err.ID_INVALID,
  'any.required': err.ID_INVALID,
})

export default idSchema
