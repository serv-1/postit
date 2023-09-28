import err from 'utils/constants/errors'
import name from 'schemas/name'

const searchPostQuery = name.messages({
  'string.base': err.QUERY_INVALID,
  'string.empty': err.QUERY_REQUIRED,
  'string.pattern.invert.base': err.QUERY_INVALID,
  'string.max': err.QUERY_MAX,
})

export default searchPostQuery
