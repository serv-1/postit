import updateDiscussionSchema from '../../schemas/updateDiscussionSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { message: 'yo', csrfToken: 'token' }
  const result = updateDiscussionSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the property "message" is undefined', () => {
  const { error: e } = updateDiscussionSchema.validate({ csrfToken: 'token' })
  expect(e?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})
