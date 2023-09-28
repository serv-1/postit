import createUser from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = createUser.validate({
    name: 'bob',
    email: 'bob@bob.bob',
    password: 'super bob pw',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const { error } = createUser.validate({
    email: 'bob@bob.bob',
    password: 'super bob pw',
  })

  expect(error?.details[0].message).toBe(err.NAME_REQUIRED)
})

it('fails if the email is undefined', () => {
  const { error } = createUser.validate({
    name: 'bob',
    password: 'super bob pw',
  })

  expect(error?.details[0].message).toBe(err.EMAIL_REQUIRED)
})

it('fails if the password is undefined', () => {
  const { error } = createUser.validate({
    name: 'bob',
    email: 'bob@bob.bob',
  })

  expect(error?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})

describe('fails if the password equals to', () => {
  test('the name', () => {
    const { error } = createUser.validate({
      name: 'Bob Bobobob',
      email: 'bob@bob.bob',
      password: 'Bob Bobobob',
    })

    expect(error?.details[0].message).toBe(err.PASSWORD_SAME)
  })

  test('the email', () => {
    const { error } = createUser.validate({
      name: 'Bob',
      email: 'bob@bob.bob',
      password: 'bob@bob.bob',
    })

    expect(error?.details[0].message).toBe(err.PASSWORD_SAME)
  })
})
