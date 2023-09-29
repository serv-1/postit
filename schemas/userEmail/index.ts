import { EMAIL_INVALID, EMAIL_REQUIRED } from 'constants/errors'
import Joi from 'joi'

const userEmail = Joi.string()
  .email({ tlds: { allow: false } })
  .trim()
  .messages({
    'string.base': EMAIL_INVALID,
    'string.empty': EMAIL_REQUIRED,
    'string.email': EMAIL_INVALID,
  })

export default userEmail
