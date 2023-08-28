import updateUserApiSchema from '../../schemas/updateUserApiSchema'
import err from '../../utils/constants/errors'

const id = 'f0f0f0f0f0f0f0f0f0f0f0f0'

it('passes', () => {
  let result = updateUserApiSchema.validate({ name: 'bob' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = updateUserApiSchema.validate({ email: 'bob@bob.bob' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = updateUserApiSchema.validate({ password: 'super bob pw' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = updateUserApiSchema.validate({ image: 'keyName' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = updateUserApiSchema.validate({ favPostId: id })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = updateUserApiSchema.validate({ discussionId: id })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if there is too many properties', () => {
  const { error: e } = updateUserApiSchema.validate({
    name: 'bob',
    email: 'bob@bob.bob',
  })

  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})

it('fails if there is missing properties', () => {
  const { error: e } = updateUserApiSchema.validate({})
  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})
