import Joi from 'joi'
import categories from '../../categories'
import err from '../../utils/constants/errors'

export const categoriesSchema = Joi.array()
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
  .max(3)
  .messages({
    'array.base': err.CATEGORIES_INVALID,
    'array.excludes': err.CATEGORIES_INVALID,
    'array.includes': err.CATEGORIES_INVALID,
    'array.includesRequiredBoth': err.CATEGORIES_INVALID,
    'array.includesRequiredKnowns': err.CATEGORIES_INVALID,
    'array.includesRequiredUnKnowns': err.CATEGORIES_INVALID,
    'array.min': err.CATEGORIES_REQUIRED,
    'array.max': err.CATEGORIES_MAX,
  })

export const reqCategoriesSchema = categoriesSchema
  .required()
  .messages({ 'any.required': err.CATEGORIES_REQUIRED })
