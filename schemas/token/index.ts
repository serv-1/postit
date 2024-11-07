import { TOKEN_INVALID, TOKEN_REQUIRED } from 'constants/errors'
import Joi from 'joi'

const token = Joi.string().hex().length(64).messages({
  'string.base': TOKEN_INVALID,
  'string.empty': TOKEN_REQUIRED,
  'string.length': TOKEN_INVALID,
  'string.hex': TOKEN_INVALID,
})

export default token
