import { DATA_INVALID } from 'constants/errors'
import Joi from 'joi'

export default function createObjectSchema<TSchema>(
  schema?: Joi.PartialSchemaMap<TSchema>
) {
  return Joi.object<TSchema>(schema).required().unknown(false).messages({
    'object.base': DATA_INVALID,
    'any.required': DATA_INVALID,
    'object.unknown': DATA_INVALID,
  })
}
