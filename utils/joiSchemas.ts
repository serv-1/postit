import Joi from 'joi'
import {
  dataInvalid,
  emailInvalid,
  emailRequired,
  passwordEmail,
  passwordInvalid,
  passwordMax,
  passwordMin,
  passwordRequired,
  usernameInvalid,
  usernameMax,
  usernameRequired,
} from './errors'

export const signupSchema = Joi.object({
  username: Joi.string().required().max(90).messages({
    'string.base': usernameInvalid,
    'string.empty': usernameRequired,
    'any.required': usernameRequired,
    'string.max': usernameMax,
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': emailInvalid,
      'string.empty': emailRequired,
      'string.email': emailInvalid,
      'any.required': emailRequired,
    }),
  password: Joi.string()
    .invalid(Joi.ref('email'))
    .min(10)
    .max(20)
    .required()
    .messages({
      'string.base': passwordInvalid,
      'string.empty': passwordRequired,
      'any.invalid': passwordEmail,
      'string.min': passwordMin,
      'string.max': passwordMax,
      'any.required': passwordRequired,
    }),
})
  .required()
  .messages({
    'object.base': dataInvalid,
    'object.required': dataInvalid,
  })

export const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      'string.base': emailInvalid,
      'string.empty': emailRequired,
      'string.email': emailInvalid,
      'any.required': emailRequired,
    }),
  password: Joi.string().required().messages({
    'string.base': passwordInvalid,
    'string.empty': passwordRequired,
    'any.required': passwordRequired,
  }),
})
  .required()
  .messages({
    'object.base': dataInvalid,
    'object.required': dataInvalid,
  })
