import Joi from 'joi'
import {
  DATA_INVALID,
  EMAIL_INVALID,
  EMAIL_REQUIRED,
  PASSWORD_SAME,
  PASSWORD_INVALID,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PASSWORD_REQUIRED,
  NAME_INVALID,
  NAME_MAX,
  NAME_REQUIRED,
} from './errors'

export const emailRules = Joi.string()
  .required()
  .email({ tlds: { allow: false } })
  .messages({
    'string.base': EMAIL_INVALID,
    'string.empty': EMAIL_REQUIRED,
    'string.email': EMAIL_INVALID,
    'any.required': EMAIL_REQUIRED,
  })

export const registerSchema = Joi.object({
  name: Joi.string().required().max(90).messages({
    'string.base': NAME_INVALID,
    'string.empty': NAME_REQUIRED,
    'any.required': NAME_REQUIRED,
    'string.max': NAME_MAX,
  }),
  email: emailRules,
  password: Joi.string()
    .invalid(Joi.ref('email'), Joi.ref('name'))
    .min(10)
    .max(20)
    .required()
    .messages({
      'string.base': PASSWORD_INVALID,
      'string.empty': PASSWORD_REQUIRED,
      'any.invalid': PASSWORD_SAME,
      'string.min': PASSWORD_MIN,
      'string.max': PASSWORD_MAX,
      'any.required': PASSWORD_REQUIRED,
    }),
})
  .required()
  .messages({
    'object.base': DATA_INVALID,
    'object.required': DATA_INVALID,
  })

export const signInSchema = Joi.object({
  email: emailRules,
  password: Joi.string().required().messages({
    'string.base': PASSWORD_INVALID,
    'string.empty': PASSWORD_REQUIRED,
    'any.required': PASSWORD_REQUIRED,
  }),
})
  .required()
  .messages({
    'object.base': DATA_INVALID,
    'object.required': DATA_INVALID,
  })

export const emailSchema = Joi.object({
  email: emailRules,
})
  .required()
  .messages({
    'object.base': DATA_INVALID,
    'object.required': DATA_INVALID,
  })
