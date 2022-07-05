import Joi from 'joi'
import err from '../utils/constants/errors'

const createdAtSchema = Joi.date().iso().messages({
  'date.base': err.CREATED_AT_INVALID,
  'date.strict': err.CREATED_AT_INVALID,
  'date.format': err.CREATED_AT_INVALID,
  'any.required': err.CREATED_AT_REQUIRED,
})

export default createdAtSchema
