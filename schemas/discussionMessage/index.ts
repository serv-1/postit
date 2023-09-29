import {
  MESSAGE_INVALID,
  MESSAGE_REQUIRED,
  MESSAGE_MAX,
} from 'constants/errors'
import Joi from 'joi'

const discussionMessage = Joi.string().max(500).trim().messages({
  'string.base': MESSAGE_INVALID,
  'string.empty': MESSAGE_REQUIRED,
  'string.max': MESSAGE_MAX,
})

export default discussionMessage
