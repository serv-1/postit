import Joi from 'joi'
import err from '../utils/constants/errors'

const addressSchema = Joi.string().trim().messages({
  'string.base': err.ADDRESS_INVALID,
  'string.empty': err.ADDRESS_REQUIRED,
  'string.max': err.ADDRESS_MAX,
  'any.required': err.ADDRESS_REQUIRED,
})

export default addressSchema
