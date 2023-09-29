import { ID_INVALID } from 'constants/errors'
import Joi from 'joi'
import { isValidObjectId } from 'mongoose'

const id = Joi.any()
  .custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.error('any.invalid')
    }

    return value
  })
  .messages({ 'any.invalid': ID_INVALID })

export default id
