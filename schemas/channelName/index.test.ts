import channelName from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = channelName.validate('0')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error } = channelName.validate(1)

  expect(error?.details[0].message).toBe(err.CHANNEL_NAME_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = channelName.validate('')

  expect(error?.details[0].message).toBe(err.CHANNEL_NAME_REQUIRED)
})

it('fails if the value is an invalid channel name', () => {
  const { error } = channelName.validate('ééé')

  expect(error?.details[0].message).toBe(err.CHANNEL_NAME_INVALID)
})

it('fails if the value is too long', () => {
  const { error } = channelName.validate(new Uint8Array(147).toString())

  expect(error?.details[0].message).toBe(err.CHANNEL_NAME_MAX)
})
