import Joi from 'joi'
import err from 'utils/constants/errors'

const imageKey = Joi.string().max(1024, 'utf8').messages({
  'string.base': err.IMAGE_INVALID,
  'string.empty': err.IMAGE_REQUIRED,
  'string.max': err.IMAGE_INVALID,
})

export default imageKey
