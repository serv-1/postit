import updatePostApiSchema from '../../schemas/updatePostApiSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { csrfToken: 'token', address: 'Paris', latLon: [17, 58] }
  const result = updatePostApiSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if latLon is missing with address', () => {
  const value = { csrfToken: 'token', address: 'Paris' }
  const { error: e } = updatePostApiSchema.validate(value)
  expect(e?.details[0].message).toBe(err.ADDRESS_INVALID)
})
