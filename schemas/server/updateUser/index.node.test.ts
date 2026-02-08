/**
 * @jest-environment node
 */

import { Types } from 'mongoose'
import updateUser from '.'
import { DATA_INVALID } from 'constants/errors'

it('passes with the name', () => {
  const result = updateUser.validate({ name: 'john' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('passes with the email', () => {
  const result = updateUser.validate({ email: 'john@test.com' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('passes with the password', () => {
  const result = updateUser.validate({ password: 'john password' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('passes with the image', () => {
  const result = updateUser.validate({ image: 'john.jpeg' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('passes with the favorite post id', () => {
  const result = updateUser.validate({
    favPostId: new Types.ObjectId().toString(),
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('passes with the discussion id', () => {
  const result = updateUser.validate({
    discussionId: new Types.ObjectId().toString(),
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if there is nothing to update', () => {
  const { error } = updateUser.validate({})

  expect(error?.details[0].message).toBe(DATA_INVALID)
})

it('fails if there is more than 1 thing to update', () => {
  const { error } = updateUser.validate({
    name: 'john',
    email: 'john@test.com',
  })

  expect(error?.details[0].message).toBe(DATA_INVALID)
})
