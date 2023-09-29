import { QUERY_INVALID, QUERY_REQUIRED, QUERY_MAX } from 'constants/errors'
import name from 'schemas/name'

const searchPostQuery = name.messages({
  'string.base': QUERY_INVALID,
  'string.empty': QUERY_REQUIRED,
  'string.pattern.invert.base': QUERY_INVALID,
  'string.max': QUERY_MAX,
})

export default searchPostQuery
