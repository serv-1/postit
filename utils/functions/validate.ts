import { Schema } from 'joi'

type ValidateReturn<Value> =
  | {
      value: NonNullable<Value>
    }
  | {
      value: Value
      name: string | number
      message: string
    }

/**
 * Validate that the given value match the given schema.
 *
 * @param schema schema to validate the value
 * @param value value that will be validated against the schema
 * @returns validated value with the error's name (if any) and message
 */
const validate = <TSchema, TValue>(
  schema: Schema<TSchema>,
  value: TValue
): ValidateReturn<TValue> => {
  const result = schema.validate(value)

  if (!result.error) {
    return { value: result.value }
  }

  const { path, message } = result.error.details[0]

  return { value: result.value, name: path[0], message }
}

export default validate
