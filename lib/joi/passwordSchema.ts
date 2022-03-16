import Joi from 'joi'
import err from '../../utils/constants/errors'
import { csrfTokenSchema } from './csrfTokenSchema'
import object from './object'

export const passwordSchema = Joi.string()
  .min(10)
  .max(20)
  .required()
  .trim()
  .messages({
    'string.base': err.PASSWORD_INVALID,
    'string.empty': err.PASSWORD_REQUIRED,
    'any.invalid': err.PASSWORD_SAME,
    'string.min': err.PASSWORD_MIN,
    'string.max': err.PASSWORD_MAX,
    'any.required': err.PASSWORD_REQUIRED,
  })

export interface PasswordCsrfSchema {
  csrfToken: string
  password: string
}

export const passwordCsrfSchema = object<PasswordCsrfSchema>({
  csrfToken: csrfTokenSchema,
  password: passwordSchema,
})
