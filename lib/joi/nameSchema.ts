import Joi from 'joi'
import err from '../../utils/constants/errors'
import { csrfTokenSchema } from './csrfTokenSchema'
import object from './object'

export const nameSchema = Joi.string().required().trim().max(90).messages({
  'string.base': err.NAME_INVALID,
  'string.empty': err.NAME_REQUIRED,
  'any.required': err.NAME_REQUIRED,
  'string.max': err.NAME_MAX,
})

export const nameCsrfSchema = object({
  csrfToken: csrfTokenSchema,
  name: nameSchema,
})
