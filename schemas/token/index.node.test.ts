/**
 * @jest-environment node
 */

import { TOKEN_INVALID, TOKEN_REQUIRED } from 'constants/errors'
import token from '.'

it('passes', () => {
  const result = token.validate('f'.repeat(64))

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error } = token.validate({})

  expect(error?.details[0].message).toBe(TOKEN_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = token.validate('')

  expect(error?.details[0].message).toBe(TOKEN_REQUIRED)
})

it('fails if the value is not hexadecimal', () => {
  const { error } = token.validate('ag')

  expect(error?.details[0].message).toBe(TOKEN_INVALID)
})

it('fails if the value is too long', () => {
  const { error } = token.validate('f'.repeat(65))

  expect(error?.details[0].message).toBe(TOKEN_INVALID)
})
