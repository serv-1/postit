import querySchema from '../../schemas/querySchema'
import err from '../../utils/constants/errors'

it('passes and trim the result', () => {
  const result = querySchema.validate(' table ')
  expect(result.value).toBe('table')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is an empty string', () => {
  const { error: e } = querySchema.validate('')
  expect(e?.details[0].message).toBe(err.QUERY_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error: e } = querySchema.validate(1)
  expect(e?.details[0].message).toBe(err.QUERY_INVALID)
})

it('fails if the value contain emojis', () => {
  const { error: e } = querySchema.validate('dog 🐶')
  expect(e?.details[0].message).toBe(err.QUERY_INVALID)
})

it('fails if the value is too long', () => {
  const { error: e } = querySchema.validate(new Uint8Array(91).toString())
  expect(e?.details[0].message).toBe(err.QUERY_MAX)
})
