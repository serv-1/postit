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

export const registerSchema = Joi.object({
  name: nameRules,
  email: emailRules,
  password: passwordRules.invalid(Joi.ref('email'), Joi.ref('name')),
})
  .required()
  .messages({
    'object.base': err.DATA_INVALID,
    'object.required': err.DATA_INVALID,
  })

export const signInSchema = Joi.object({
  email: emailRules,
  password: Joi.string().required().messages({
    'string.base': err.PASSWORD_INVALID,
    'string.empty': err.PASSWORD_REQUIRED,
    'any.required': err.PASSWORD_REQUIRED,
  }),
})
  .required()
  .messages({
    'object.base': err.DATA_INVALID,
    'object.required': err.DATA_INVALID,
  })

export const emailSchema = Joi.object({ email: emailRules })
  .required()
  .messages({
    'object.base': err.DATA_INVALID,
    'object.required': err.DATA_INVALID,
  })

export const nameSchema = Joi.object({ name: nameRules }).required().messages({
  'object.base': err.DATA_INVALID,
  'object.required': err.DATA_INVALID,
})

export const passwordSchema = Joi.object({ password: passwordRules })
  .required()
  .messages({
    'object.base': err.DATA_INVALID,
    'object.required': err.DATA_INVALID,
  })
