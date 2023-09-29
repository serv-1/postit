import type { Schema } from 'joi'

type ValidateReturn<Value> =
  | {
      value: Value
    }
  | {
      value?: Value
      name: string | number
      message: string
    }

export default function validate<TSchema>(
  schema: Schema<TSchema>,
  value: unknown
): ValidateReturn<TSchema> {
  const result = schema.validate(value)

  if (!result.error) {
    return { value: result.value }
  }

  const { path, message } = result.error.details[0]

  return { value: result.value, name: path[0], message }
}
