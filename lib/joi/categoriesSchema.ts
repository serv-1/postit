import Joi from 'joi'
import categories from '../../categories'
import err from '../../utils/constants/errors'
import csrfTokenSchema from './csrfTokenSchema'
import object from './object'

export const categoriesSchema = Joi.array()
  .items(Joi.any().valid(...categories))
  .min(1)
  .max(3)
  .messages({
    'array.base': err.CATEGORIES_INVALID,
    'any.only': err.CATEGORIES_INVALID,
    'array.min': err.CATEGORIES_REQUIRED,
    'array.max': err.CATEGORIES_MAX,
  })

export const reqCategoriesSchema = categoriesSchema
  .required()
  .messages({ 'any.required': err.CATEGORIES_REQUIRED })

export const reqCategoriesCsrfSchema = object({
  categories: reqCategoriesSchema,
  csrfToken: csrfTokenSchema,
})
