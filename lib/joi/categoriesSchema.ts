import Joi from 'joi'
import categories from '../../categories'
import err from '../../utils/constants/errors'

export const categoriesSchema = Joi.array()
  .required()
  .items(Joi.any().valid(...categories))
  .min(1)
  .max(3)
  .messages({
    'array.base': err.CATEGORIES_INVALID,
    'any.only': err.CATEGORIES_INVALID,
    'array.min': err.CATEGORIES_REQUIRED,
    'array.max': err.CATEGORIES_MAX,
    'any.required': err.CATEGORIES_REQUIRED,
  })
