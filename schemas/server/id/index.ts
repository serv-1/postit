import Joi from 'joi'
import err from 'utils/constants/errors'
import { isValidObjectId } from 'mongoose'

const id = Joi.any()
  .custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.error('any.invalid')
    }

    return value
  })
  .messages({ 'any.invalid': err.ID_INVALID })

export default id
