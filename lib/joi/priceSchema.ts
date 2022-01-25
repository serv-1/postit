import Joi from 'joi'
import err from '../../utils/constants/errors'

const priceSchema = Joi.number().required().positive().precision(2).messages({
  'number.base': err.PRICE_INVALID,
  'number.required': err.PRICE_REQUIRED,
  'number.positive': err.PRICE_INVALID,
  'number.integer': err.PRICE_INVALID,
})

export default priceSchema
