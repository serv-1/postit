import Joi from 'joi'
import { CATEGORIES } from 'constants/index'
import { CATEGORIES_INVALID, CATEGORIES_MAX } from 'constants/errors'

const postCategories = Joi.array()
  .items(Joi.string().valid(...CATEGORIES))
  .max(3)
  .unique()
  .messages({
    'array.base': CATEGORIES_INVALID,
    'any.only': CATEGORIES_INVALID,
    'array.max': CATEGORIES_MAX,
    'array.unique': CATEGORIES_INVALID,
  })

export default postCategories
