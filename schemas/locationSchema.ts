import Joi from 'joi'
import err from '../utils/constants/errors'

const locationSchema = Joi.string().trim().messages({
  'string.base': err.LOCATION_INVALID,
  'string.empty': err.LOCATION_REQUIRED,
  'string.max': err.LOCATION_MAX,
  'any.required': err.LOCATION_REQUIRED,
})

export default locationSchema
