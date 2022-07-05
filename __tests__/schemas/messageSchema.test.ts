import messageSchema from '../../schemas/messageSchema'
import err from '../../utils/constants/errors'

const MESSAGE = {
  message: ' yo yo ',
  createdAt: new Date().toISOString(),
  isBuyerMsg: true,
}

it('passes and trims the message property', () => {
  const result = messageSchema.validate(MESSAGE)
  expect(result.value?.message).toBe('yo yo')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an object', () => {
  const { error: e } = messageSchema.validate('')
  expect(e?.details[0].message).toBe(err.MESSAGE_INVALID)
})

it('fails if the value is undefined', () => {
  const { error: e } = messageSchema.validate(undefined)
  expect(e?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})

it('fails if the value has an unknown property', () => {
  const { error: e } = messageSchema.validate({ ...MESSAGE, oh: 'no' })
  expect(e?.details[0].message).toBe(err.MESSAGE_INVALID)
})

it('fails if the message property is not a string', () => {
  const { error: e } = messageSchema.validate({ ...MESSAGE, message: 1 })
  expect(e?.details[0].message).toBe(err.MESSAGE_INVALID)
})

it('fails if the message property is an empty string', () => {
  const { error: e } = messageSchema.validate({ ...MESSAGE, message: '' })
  expect(e?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})

it('fails if the message property is too long', () => {
  const message = { ...MESSAGE, message: new Uint8Array(501).toString() }
  const { error: e } = messageSchema.validate(message)
  expect(e?.details[0].message).toBe(err.MESSAGE_MAX)
})

it('fails if the createdAt property is not a date', () => {
  const { error: e } = messageSchema.validate({ ...MESSAGE, createdAt: '' })
  expect(e?.details[0].message).toBe(err.CREATED_AT_INVALID)
})

it('fails if the createdAt property is not an ISO date string', () => {
  const message = { ...MESSAGE, createdAt: new Date().toString() }
  const { error: e } = messageSchema.validate(message)
  expect(e?.details[0].message).toBe(err.CREATED_AT_INVALID)
})

it('fails if the isBuyerMsg property is not a boolean', () => {
  const { error: e } = messageSchema.validate({ ...MESSAGE, isBuyerMsg: 1 })
  expect(e?.details[0].message).toBe(err.MESSAGE_INVALID)
})

it('fails if one of the property is undefined', () => {
  const msg1 = { ...MESSAGE, message: undefined }
  const { error: e1 } = messageSchema.validate(msg1)
  expect(e1?.details[0].message).toBe(err.MESSAGE_REQUIRED)

  const msg2 = { ...MESSAGE, createdAt: undefined }
  const { error: e2 } = messageSchema.validate(msg2)
  expect(e2?.details[0].message).toBe(err.CREATED_AT_REQUIRED)

  const msg3 = { ...MESSAGE, isBuyerMsg: undefined }
  const { error: e3 } = messageSchema.validate(msg3)
  expect(e3?.details[0].message).toBe(err.MESSAGE_INVALID)
})
