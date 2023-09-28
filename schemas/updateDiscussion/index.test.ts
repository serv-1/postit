import updateDiscussion from 'schemas/updateDiscussion'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = updateDiscussion.validate({ message: 'yo' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the message is undefined', () => {
  const { error } = updateDiscussion.validate({})

  expect(error?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})
