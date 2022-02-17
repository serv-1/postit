import err from '../../utils/constants/errors'
import { nameSchema } from './nameSchema'

export const querySchema = nameSchema.messages({
  'string.base': err.QUERY_INVALID,
  'string.empty': err.QUERY_REQUIRED,
  'any.required': err.QUERY_REQUIRED,
  'string.max': err.QUERY_MAX,
})
