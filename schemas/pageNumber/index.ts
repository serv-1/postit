import { PAGE_INVALID } from 'constants/errors'
import Joi from 'joi'

const pageNumber = Joi.number().greater(-1).messages({
  'number.base': PAGE_INVALID,
  'number.infinity': PAGE_INVALID,
  'number.greater': PAGE_INVALID,
})

export default pageNumber
