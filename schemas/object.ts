import Joi from 'joi'
import err from '../utils/constants/errors'

const object = <TSchema>(schema?: Joi.PartialSchemaMap<TSchema>) => {
  return Joi.object<TSchema>(schema).required().unknown(false).messages({
    'object.base': err.DATA_INVALID,
    'any.required': err.DATA_INVALID,
    'object.unknown': err.DATA_INVALID,
  })
}

export default object
