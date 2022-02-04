import Joi from 'joi'
import err from '../../utils/constants/errors'

const descriptionSchema = Joi.string()
  .required()
  .trim()
  .min(10)
  .max(300)
  .messages({
    'string.base': err.DESCRIPTION_INVALID,
    'string.empty': err.DESCRIPTION_REQUIRED,
    'any.required': err.DESCRIPTION_REQUIRED,
    'string.min': err.DESCRIPTION_MIN,
    'string.max': err.DESCRIPTION_MAX,
  })

export default descriptionSchema
