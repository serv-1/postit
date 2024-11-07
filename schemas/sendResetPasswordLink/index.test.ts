/**
 * @jest-environment node
 */

import { EMAIL_REQUIRED } from 'constants/errors'
import sendResetPasswordLink from '.'

it('passes', () => {
  const result = sendResetPasswordLink.validate({ email: 'bob@bob.bob' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const { error } = sendResetPasswordLink.validate({})

  expect(error?.details[0].message).toBe(EMAIL_REQUIRED)
})
