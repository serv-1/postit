import { PRICE_INVALID } from 'constants/errors'
import Joi from 'joi'

const postPrice = Joi.number().min(0).precision(2).messages({
  'number.base': PRICE_INVALID,
  'number.infinity': PRICE_INVALID,
  'number.min': PRICE_INVALID,
})

export default postPrice
