import Joi from 'joi'
import err from '../../utils/constants/errors'

export const priceSchema = Joi.number().min(0).precision(2).messages({
  'number.base': err.PRICE_INVALID,
  'number.infinity': err.PRICE_INVALID,
  'number.integer': err.PRICE_INVALID,
  'number.min': err.PRICE_INVALID,
})

export const reqPriceSchema = priceSchema
  .min(1)
  .required()
  .messages({ 'any.required': err.PRICE_REQUIRED })
