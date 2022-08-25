import Joi from 'joi'
import err from '../utils/constants/errors'

const messageSchema = Joi.string().max(500).trim().messages({
  'string.base': err.MESSAGE_INVALID,
  'string.empty': err.MESSAGE_REQUIRED,
  'string.max': err.MESSAGE_MAX,
  'any.required': err.MESSAGE_REQUIRED,
})

export default messageSchema
