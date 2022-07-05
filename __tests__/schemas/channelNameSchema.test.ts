import channelNameSchema from '../../schemas/channelNameSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = channelNameSchema.validate('0')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error: e } = channelNameSchema.validate(1)
  expect(e?.details[0].message).toBe(err.CHANNEL_NAME_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error: e } = channelNameSchema.validate('')
  expect(e?.details[0].message).toBe(err.CHANNEL_NAME_REQUIRED)
})

it('fails if the value is an invalid channel name', () => {
  const { error: e } = channelNameSchema.validate('ééé')
  expect(e?.details[0].message).toBe(err.CHANNEL_NAME_INVALID)
})

it('fails if the value is too long', () => {
  const value = new Uint8Array(147).toString()
  const { error: e } = channelNameSchema.validate(value)
  expect(e?.details[0].message).toBe(err.CHANNEL_NAME_MAX)
})
