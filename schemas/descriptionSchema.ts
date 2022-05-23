import Joi from 'joi'
import err from '../utils/constants/errors'

const descriptionSchema = Joi.string().min(10).max(300).trim().messages({
  'string.base': err.DESCRIPTION_INVALID,
  'string.empty': err.DESCRIPTION_REQUIRED,
  'string.min': err.DESCRIPTION_MIN,
  'string.max': err.DESCRIPTION_MAX,
  'any.required': err.DESCRIPTION_REQUIRED,
})

export default descriptionSchema
