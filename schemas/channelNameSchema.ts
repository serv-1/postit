import Joi from 'joi'
import err from '../utils/constants/errors'

const channelNameSchema = Joi.string()
  .max(146)
  .pattern(/^[a-zA-Z0-9_\-=@,.;]+$/)
  .messages({
    'string.base': err.CHANNEL_NAME_INVALID,
    'string.empty': err.CHANNEL_NAME_REQUIRED,
    'string.max': err.CHANNEL_NAME_MAX,
    'string.pattern.base': err.CHANNEL_NAME_INVALID,
    'any.required': err.CHANNEL_NAME_REQUIRED,
  })

export default channelNameSchema
