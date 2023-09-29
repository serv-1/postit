import { ADDRESS_INVALID, ADDRESS_REQUIRED } from 'constants/errors'
import Joi from 'joi'

const postAddress = Joi.string().trim().messages({
  'string.base': ADDRESS_INVALID,
  'string.empty': ADDRESS_REQUIRED,
})

export default postAddress
