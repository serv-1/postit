import Joi from 'joi'
import err from 'utils/constants/errors'

const userEmail = Joi.string()
  .email({ tlds: { allow: false } })
  .trim()
  .messages({
    'string.base': err.EMAIL_INVALID,
    'string.empty': err.EMAIL_REQUIRED,
    'string.email': err.EMAIL_INVALID,
  })

export default userEmail
