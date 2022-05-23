import addUserSchema from '../../schemas/addUserSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { name: 'bob', email: 'bob@bob.bob', password: 'super bob pw' }
  const result = addUserSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if name is undefined', () => {
  const { error: e } = addUserSchema.validate({
    email: 'bob@bob.bob',
    password: 'super bob pw',
  })
  expect(e?.details[0].message).toBe(err.NAME_REQUIRED)
})

it('fails if email is undefined', () => {
  const { error: e } = addUserSchema.validate({
    name: 'bob',
    password: 'super bob pw',
  })
  expect(e?.details[0].message).toBe(err.EMAIL_REQUIRED)
})

it('fails if password is undefined', () => {
  const { error: e } = addUserSchema.validate({
    name: 'bob',
    email: 'bob@bob.bob',
  })
  expect(e?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})

it('fails if the password equals the name or the email', () => {
  const value = {
    name: 'Bob Bobobob',
    email: 'bob@bob.bob',
    password: 'Bob Bobobob',
  }
  const { error: e } = addUserSchema.validate(value)
  expect(e?.details[0].message).toBe(err.PASSWORD_SAME)

  const _value = { ...value, password: 'bob@bob.bob' }
  const { error: _e } = addUserSchema.validate(_value)
  expect(_e?.details[0].message).toBe(err.PASSWORD_SAME)
})
