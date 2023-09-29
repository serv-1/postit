import { IMAGE_INVALID, IMAGE_REQUIRED } from 'constants/errors'
import Joi from 'joi'

const imageKey = Joi.string().max(1024, 'utf8').messages({
  'string.base': IMAGE_INVALID,
  'string.empty': IMAGE_REQUIRED,
  'string.max': IMAGE_INVALID,
})

export default imageKey
