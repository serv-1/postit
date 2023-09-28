import Joi from 'joi'
import err from 'utils/constants/errors'

const postAddress = Joi.string().trim().messages({
  'string.base': err.ADDRESS_INVALID,
  'string.empty': err.ADDRESS_REQUIRED,
})

export default postAddress
