/**
 * @jest-environment node
 */

import mongoose from 'mongoose'
import resetPassword from '.'
import {
  ID_REQUIRED,
  PASSWORD_REQUIRED,
  TOKEN_REQUIRED,
} from 'constants/errors'

it('passes', () => {
  const result = resetPassword.validate({
    password: '0123456789',
    token: 'f'.repeat(64),
    userId: new mongoose.Types.ObjectId(),
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the password is undefined', () => {
  const { error } = resetPassword.validate({
    token: 'f'.repeat(64),
    userId: new mongoose.Types.ObjectId(),
  })

  expect(error?.details[0].message).toBe(PASSWORD_REQUIRED)
})

it('fails if the token is undefined', () => {
  const { error } = resetPassword.validate({
    password: '0123456789',
    userId: new mongoose.Types.ObjectId(),
  })

  expect(error?.details[0].message).toBe(TOKEN_REQUIRED)
})

it('fails if the userId is undefined', () => {
  const { error } = resetPassword.validate({
    password: '0123456789',
    token: 'f'.repeat(64),
  })

  expect(error?.details[0].message).toBe(ID_REQUIRED)
})
