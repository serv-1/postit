import messageSchema from '../../schemas/messageSchema'
import err from '../../utils/constants/errors'

it('passes and trims the message property', () => {
  const result = messageSchema.validate('yo')
  expect(result.value).toBe('yo')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error: e } = messageSchema.validate(1)
  expect(e?.details[0].message).toBe(err.MESSAGE_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error: e } = messageSchema.validate('')
  expect(e?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})

it('fails if the value is too long', () => {
  const { error: e } = messageSchema.validate(new Uint8Array(501).toString())
  expect(e?.details[0].message).toBe(err.MESSAGE_MAX)
})
