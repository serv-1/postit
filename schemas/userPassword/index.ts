import Joi from 'joi'
import err from 'utils/constants/errors'

const userPassword = Joi.string().min(10).max(20).trim().messages({
  'string.base': err.PASSWORD_INVALID,
  'string.empty': err.PASSWORD_REQUIRED,
  'string.min': err.PASSWORD_MIN,
  'string.max': err.PASSWORD_MAX,
})

export default userPassword
