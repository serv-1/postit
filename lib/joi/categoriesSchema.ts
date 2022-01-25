import Joi from 'joi'
import categories from '../../categories'
import err from '../../utils/constants/errors'

const categoriesSchema = Joi.array()
  .required()
  .items(
    Joi.string()
      .valid(...categories)
      .messages({
        'string.base': err.CATEGORY_INVALID,
        'string.empty': err.CATEGORY_INVALID,
        'any.only': err.CATEGORY_INVALID,
      })
  )
  .min(1)
  .max(10)
  .messages({
    'array.base': err.CATEGORIES_INVALID,
    'any.required': err.CATEGORIES_REQUIRED,
    'array.excludes': err.CATEGORIES_INVALID,
    'array.includes': err.CATEGORIES_INVALID,
    'array.includesRequiredBoth': err.CATEGORIES_INVALID,
    'array.includesRequiredKnowns': err.CATEGORIES_INVALID,
    'array.includesRequiredUnKnowns': err.CATEGORIES_INVALID,
    'array.min': err.CATEGORIES_REQUIRED,
    'array.max': err.CATEGORIES_MAX,
  })

export default categoriesSchema
