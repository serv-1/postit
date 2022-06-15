import addressSchema from '../../schemas/addressSchema'
import err from '../../utils/constants/errors'

it('passes and trim the result', () => {
  const result = addressSchema.validate(' Oslo, Norway ')
  expect(result.value).toBe('Oslo, Norway')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is an empty string', () => {
  const { error: e } = addressSchema.validate('')
  expect(e?.details[0].message).toBe(err.ADDRESS_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error: e } = addressSchema.validate(1)
  expect(e?.details[0].message).toBe(err.ADDRESS_INVALID)
})
