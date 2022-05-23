import updateUserNameSchema from '../../schemas/updateUserNameSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { csrfToken: 'csrfToken', name: 'bob' }
  const result = updateUserNameSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const value = { csrfToken: 'csrfToken' }
  const { error: e } = updateUserNameSchema.validate(value)
  expect(e?.details[0].message).toBe(err.NAME_REQUIRED)
})
