import Joi from 'joi'
import err from './errors'

const nameRules = Joi.string().required().max(90).messages({
  'string.base': err.NAME_INVALID,
  'string.empty': err.NAME_REQUIRED,
  'any.required': err.NAME_REQUIRED,
  'string.max': err.NAME_MAX,
})

const emailRules = Joi.string()
  .required()
  .email({ tlds: { allow: false } })
  .messages({
    'string.base': err.EMAIL_INVALID,
    'string.empty': err.EMAIL_REQUIRED,
    'string.email': err.EMAIL_INVALID,
    'any.required': err.EMAIL_REQUIRED,
  })

const passwordRules = Joi.string().min(10).max(20).required().messages({
  'string.base': err.PASSWORD_INVALID,
  'string.empty': err.PASSWORD_REQUIRED,
  'any.invalid': err.PASSWORD_SAME,
  'string.min': err.PASSWORD_MIN,
  'string.max': err.PASSWORD_MAX,
  'any.required': err.PASSWORD_REQUIRED,
})

const csrfTokenRules = Joi.string()
  .required()
  .messages({ '*': err.DATA_INVALID })

export const registerSchema = object({
  name: nameRules,
  email: emailRules,
  password: passwordRules.invalid(Joi.ref('email'), Joi.ref('name')),
})

export const signInSchema = object({
  email: emailRules,
  password: Joi.string().required().messages({
    'string.base': err.PASSWORD_INVALID,
    'string.empty': err.PASSWORD_REQUIRED,
    'any.required': err.PASSWORD_REQUIRED,
  }),
})

export const emailSchema = object({
  email: emailRules,
})

export const emailCsrfSchema = object({
  email: emailRules,
  csrfToken: csrfTokenRules,
})

export const nameSchema = object({
  name: nameRules,
})

export const nameCsrfSchema = object({
  name: nameRules,
  csrfToken: csrfTokenRules,
})

export const passwordSchema = object({
  password: passwordRules,
})

export const passwordCsrfSchema = object({
  password: passwordRules,
  csrfToken: csrfTokenRules,
})

function object<TSchema>(schema?: Joi.PartialSchemaMap<TSchema>) {
  return Joi.object(schema).required().messages({
    'object.base': err.DATA_INVALID,
    'object.required': err.DATA_INVALID,
  })
}
