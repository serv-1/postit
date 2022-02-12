import Joi from 'joi'
import err from '../../utils/constants/errors'
import csrfTokenSchema from './csrfTokenSchema'
import object from './object'

export const priceSchema = Joi.number().allow('').min(0).precision(2).messages({
  'number.base': err.PRICE_INVALID,
  'number.infinity': err.PRICE_INVALID,
  'number.integer': err.PRICE_INVALID,
  'number.min': err.PRICE_INVALID,
})

export const reqPriceSchema = priceSchema
  .min(1)
  .required()
  .messages({ 'any.required': err.PRICE_REQUIRED })

export const reqPriceCsrfSchema = object({
  price: reqPriceSchema,
  csrfToken: csrfTokenSchema,
})
