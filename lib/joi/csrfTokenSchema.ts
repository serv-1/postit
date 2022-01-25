import Joi from 'joi'
import err from '../../utils/constants/errors'

const csrfTokenSchema = Joi.string().required().messages({
  'string.base': err.CSRF_TOKEN_INVALID,
  'string.empty': err.CSRF_TOKEN_INVALID,
  'any.required': err.CSRF_TOKEN_INVALID,
})

export default csrfTokenSchema
