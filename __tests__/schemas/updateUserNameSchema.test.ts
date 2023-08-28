import updateUserNameSchema from '../../schemas/updateUserNameSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = updateUserNameSchema.validate({ name: 'bob' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const { error: e } = updateUserNameSchema.validate({})
  expect(e?.details[0].message).toBe(err.NAME_REQUIRED)
})
