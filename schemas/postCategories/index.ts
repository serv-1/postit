import Joi from 'joi'
import categories from 'utils/constants/categories'
import err from 'utils/constants/errors'

const postCategories = Joi.array()
  .items(Joi.string().valid(...categories))
  .max(3)
  .unique()
  .messages({
    'array.base': err.CATEGORIES_INVALID,
    'any.only': err.CATEGORIES_INVALID,
    'array.max': err.CATEGORIES_MAX,
    'array.unique': err.CATEGORIES_INVALID,
  })

export default postCategories
