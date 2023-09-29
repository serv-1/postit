import {
  DESCRIPTION_INVALID,
  DESCRIPTION_REQUIRED,
  DESCRIPTION_MIN,
  DESCRIPTION_MAX,
} from 'constants/errors'
import Joi from 'joi'

const postDescription = Joi.string().min(10).max(300).trim().messages({
  'string.base': DESCRIPTION_INVALID,
  'string.empty': DESCRIPTION_REQUIRED,
  'string.min': DESCRIPTION_MIN,
  'string.max': DESCRIPTION_MAX,
})

export default postDescription
