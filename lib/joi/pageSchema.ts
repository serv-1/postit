import Joi from 'joi'
import err from '../../utils/constants/errors'

export const pageSchema = Joi.number().greater(-1).messages({
  'number.base': err.PAGE_INVALID,
  'number.infinity': err.PAGE_INVALID,
  'number.greater': err.PAGE_INVALID,
})
