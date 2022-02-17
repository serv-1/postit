import Joi from 'joi'
import err from '../../utils/constants/errors'

export const priceSchema = Joi.number()
  .required()
  .allow('')
  .min(1)
  .precision(2)
  .messages({
    'number.base': err.PRICE_INVALID,
    'number.infinity': err.PRICE_INVALID,
    'number.integer': err.PRICE_INVALID,
    'number.min': err.PRICE_INVALID,
    'any.required': err.PRICE_REQUIRED,
  })
