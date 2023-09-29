import { MESSAGE_REQUIRED } from 'constants/errors'
import updateDiscussion from 'schemas/updateDiscussion'

it('passes', () => {
  const result = updateDiscussion.validate({ message: 'yo' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the message is undefined', () => {
  const { error } = updateDiscussion.validate({})

  expect(error?.details[0].message).toBe(MESSAGE_REQUIRED)
})
