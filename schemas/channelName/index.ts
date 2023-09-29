import {
  CHANNEL_NAME_INVALID,
  CHANNEL_NAME_REQUIRED,
  CHANNEL_NAME_MAX,
} from 'constants/errors'
import Joi from 'joi'

const channelName = Joi.string()
  .max(146)
  .pattern(/^[a-zA-Z0-9_\-=@,.;]+$/)
  .messages({
    'string.base': CHANNEL_NAME_INVALID,
    'string.empty': CHANNEL_NAME_REQUIRED,
    'string.max': CHANNEL_NAME_MAX,
    'string.pattern.base': CHANNEL_NAME_INVALID,
  })

export default channelName
