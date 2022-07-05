import createdAtSchema from '../../schemas/createdAtSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = createdAtSchema.validate(new Date().toISOString())
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a date', () => {
  const { error: e } = createdAtSchema.validate('')
  expect(e?.details[0].message).toBe(err.CREATED_AT_INVALID)
})

it('fails if the value is not an ISO date string', () => {
  const { error: e } = createdAtSchema.validate(new Date().toString())
  expect(e?.details[0].message).toBe(err.CREATED_AT_INVALID)
})
