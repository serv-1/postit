import updateUserApiSchema from '../../schemas/updateUserApiSchema'
import err from '../../utils/constants/errors'

const csrfToken = 'csrfToken'
const favPostId = 'f0f0f0f0f0f0f0f0f0f0f0f0'

it('passes', () => {
  const v1 = { csrfToken, name: 'bob' }
  let result = updateUserApiSchema.validate(v1)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  const v2 = { csrfToken, email: 'bob@bob.bob' }
  result = updateUserApiSchema.validate(v2)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  const v3 = { csrfToken, password: 'super bob pw' }
  result = updateUserApiSchema.validate(v3)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  const v4 = { csrfToken, image: { base64: 'af0=', ext: 'jpg' } }
  result = updateUserApiSchema.validate(v4)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  const v5 = { csrfToken, favPostId }
  result = updateUserApiSchema.validate(v5)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if there is too many properties', () => {
  const value = { csrfToken, name: 'bob', email: 'bob@bob.bob' }
  const { error: e } = updateUserApiSchema.validate(value)
  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})
