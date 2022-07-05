import Joi from 'joi'
import err from '../utils/constants/errors'

export interface MessageSchema {
  message: string
  createdAt: string
  isBuyerMsg: boolean
}

const messageSchema = Joi.object<MessageSchema>({
  message: Joi.string().max(500).trim().required().messages({
    'string.base': err.MESSAGE_INVALID,
    'string.empty': err.MESSAGE_REQUIRED,
    'string.max': err.MESSAGE_MAX,
    'any.required': err.MESSAGE_REQUIRED,
  }),
  createdAt: Joi.date().iso().required().messages({
    'date.base': err.CREATED_AT_INVALID,
    'date.strict': err.CREATED_AT_INVALID,
    'date.format': err.CREATED_AT_INVALID,
    'any.required': err.CREATED_AT_REQUIRED,
  }),
  isBuyerMsg: Joi.boolean().required().messages({
    'boolean.base': err.MESSAGE_INVALID,
    'any.required': err.MESSAGE_INVALID,
  }),
})
  .required()
  .unknown(false)
  .messages({
    'object.base': err.MESSAGE_INVALID,
    'object.unknown': err.MESSAGE_INVALID,
    'any.required': err.MESSAGE_REQUIRED,
  })

export default messageSchema
