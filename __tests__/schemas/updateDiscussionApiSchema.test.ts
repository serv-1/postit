import updateDiscussionApiSchema from '../../schemas/updateDiscussionApiSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = updateDiscussionApiSchema.validate({
    message: {
      message: 'ah',
      createdAt: new Date().toISOString(),
      isBuyerMsg: true,
    },
    csrfToken: 'csrfToken',
  })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the message property is undefined', () => {
  const { error: e } = updateDiscussionApiSchema.validate({ csrfToken: 'csrf' })
  expect(e?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})
