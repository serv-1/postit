import {
  PASSWORD_INVALID,
  PASSWORD_REQUIRED,
  PASSWORD_MIN,
  PASSWORD_MAX,
} from 'constants/errors'
import Joi from 'joi'

const userPassword = Joi.string().min(10).max(20).trim().messages({
  'string.base': PASSWORD_INVALID,
  'string.empty': PASSWORD_REQUIRED,
  'string.min': PASSWORD_MIN,
  'string.max': PASSWORD_MAX,
})

export default userPassword
