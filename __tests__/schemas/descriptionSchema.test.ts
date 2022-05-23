import descriptionSchema from '../../schemas/descriptionSchema'
import err from '../../utils/constants/errors'

it('passes and trims the result', () => {
  const result = descriptionSchema.validate(' My description. ')
  expect(result.value).toBe('My description.')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is an empty string', () => {
  const { error: e } = descriptionSchema.validate('')
  expect(e?.details[0].message).toBe(err.DESCRIPTION_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error: e } = descriptionSchema.validate(1)
  expect(e?.details[0].message).toBe(err.DESCRIPTION_INVALID)
})

it('fails if the value is too short', () => {
  const { error: e } = descriptionSchema.validate('no')
  expect(e?.details[0].message).toBe(err.DESCRIPTION_MIN)
})

it('fails if the value is too long', () => {
  const tooLongStr = new Uint8Array(301).toString()
  const { error: e } = descriptionSchema.validate(tooLongStr)
  expect(e?.details[0].message).toBe(err.DESCRIPTION_MAX)
})
