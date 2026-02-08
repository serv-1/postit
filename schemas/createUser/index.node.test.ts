import {
  NAME_REQUIRED,
  EMAIL_REQUIRED,
  PASSWORD_REQUIRED,
  PASSWORD_SAME,
} from 'constants/errors'
import createUser from '.'

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

  expect(error?.details[0].message).toBe(NAME_REQUIRED)
})

it('fails if the email is undefined', () => {
  const { error } = createUser.validate({
    name: 'bob',
    password: 'super bob pw',
  })

  expect(error?.details[0].message).toBe(EMAIL_REQUIRED)
})

it('fails if the password is undefined', () => {
  const { error } = createUser.validate({
    name: 'bob',
    email: 'bob@bob.bob',
  })

  expect(error?.details[0].message).toBe(PASSWORD_REQUIRED)
})

describe('fails if the password equals to', () => {
  test('the name', () => {
    const { error } = createUser.validate({
      name: 'Bob Bobobob',
      email: 'bob@bob.bob',
      password: 'Bob Bobobob',
    })

    expect(error?.details[0].message).toBe(PASSWORD_SAME)
  })

  test('the email', () => {
    const { error } = createUser.validate({
      name: 'Bob',
      email: 'bob@bob.bob',
      password: 'bob@bob.bob',
    })

    expect(error?.details[0].message).toBe(PASSWORD_SAME)
  })
})
