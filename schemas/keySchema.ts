import Joi from 'joi'
import err from '../utils/constants/errors'

interface keySchema {
  csrfToken: string
  oldImageKey: string
}

const keySchema = Joi.string().max(1024, 'utf8').messages({
  'string.base': err.KEY_INVALID,
  'string.empty': err.KEY_INVALID,
  'string.max': err.KEY_INVALID,
  'any.required': err.KEY_REQUIRED,
})

export default keySchema
