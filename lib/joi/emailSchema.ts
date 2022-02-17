import Joi from 'joi'
import err from '../../utils/constants/errors'
import { csrfTokenSchema } from './csrfTokenSchema'
import object from './object'

export const emailSchema = Joi.string()
  .required()
  .email({ tlds: { allow: false } })
  .trim()
  .messages({
    'string.base': err.EMAIL_INVALID,
    'string.empty': err.EMAIL_REQUIRED,
    'string.email': err.EMAIL_INVALID,
    'any.required': err.EMAIL_REQUIRED,
  })

export const emailCsrfSchema = object({
  csrfToken: csrfTokenSchema,
  email: emailSchema,
})
