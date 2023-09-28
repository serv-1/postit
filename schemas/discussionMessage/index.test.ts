import discussionMessage from 'schemas/discussionMessage'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = discussionMessage.validate('yo')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = discussionMessage.validate('   yo   ')

  expect(result.value).toBe('yo')
})

it('fails if the value is not a string', () => {
  const { error } = discussionMessage.validate(1)

  expect(error?.details[0].message).toBe(err.MESSAGE_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = discussionMessage.validate('')

  expect(error?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})

it('fails if the value is too long', () => {
  const { error } = discussionMessage.validate(new Uint8Array(501).toString())

  expect(error?.details[0].message).toBe(err.MESSAGE_MAX)
})
