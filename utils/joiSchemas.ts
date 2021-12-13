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
  USERNAME_INVALID,
  USERNAME_MAX,
  USERNAME_REQUIRED,
} from './errors'

export const registerSchema = Joi.object({
  username: Joi.string().required().max(90).messages({
    'string.base': USERNAME_INVALID,
    'string.empty': USERNAME_REQUIRED,
    'any.required': USERNAME_REQUIRED,
    'string.max': USERNAME_MAX,
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': EMAIL_INVALID,
      'string.empty': EMAIL_REQUIRED,
      'string.email': EMAIL_INVALID,
      'any.required': EMAIL_REQUIRED,
    }),
  password: Joi.string()
    .invalid(Joi.ref('email'), Joi.ref('username'))
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
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      'string.base': EMAIL_INVALID,
      'string.empty': EMAIL_REQUIRED,
      'string.email': EMAIL_INVALID,
      'any.required': EMAIL_REQUIRED,
    }),
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
