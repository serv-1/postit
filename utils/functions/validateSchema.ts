import { Schema } from 'joi'
import { NextApiResponse } from 'next'

function validateSchema(
  schema: Schema,
  value: unknown,
  res: NextApiResponse,
  needName?: boolean
): void {
  const { error } = schema.validate(value)

  if (!error) return

  const { path, message } = error.details[0]

  if (needName) {
    return res.status(422).send({ name: path[0], message })
  }

  res.status(422).send({ message })
}

export default validateSchema
