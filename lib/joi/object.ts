import Joi from 'joi'
import err from '../../utils/constants/errors'

const object = <TSchema>(schema?: Joi.SchemaMap<TSchema>) => {
  return Joi.object(schema).required().messages({
    'object.base': err.DATA_INVALID,
    'any.required': err.DATA_INVALID,
  })
}

export default object
