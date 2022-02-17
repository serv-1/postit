import Joi from 'joi'
import err from '../../utils/constants/errors'

/**
 * Create a required object schema with the given schema.
 * Can append something to schema.
 *
 * @param schema object
 * @returns object schema (with append if defined)
 */
const object = <TSchema>(schema?: Joi.PartialSchemaMap<TSchema>) => {
  return Joi.object<TSchema>(schema).required().messages({
    'object.base': err.DATA_INVALID,
    'any.required': err.DATA_INVALID,
    'object.unknown': err.DATA_INVALID,
  })
}

export default object
