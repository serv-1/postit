import addDiscussionApiSchema from '../../schemas/addDiscussionApiSchema'
import err from '../../utils/constants/errors'

const DISCUSSION = {
  message: {
    message: 'Hello, world!',
    createdAt: new Date().toISOString(),
    isBuyerMsg: false,
  },
  postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  sellerId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  postName: 'Table',
  csrfToken: 'csrfToken',
}

it('passes', () => {
  const result = addDiscussionApiSchema.validate(DISCUSSION)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if postId, sellerId or postName are undefined', () => {
  const v1 = { ...DISCUSSION, postId: undefined }
  const { error: e1 } = addDiscussionApiSchema.validate(v1)
  expect(e1?.details[0].message).toBe(err.ID_INVALID)

  const v2 = { ...DISCUSSION, sellerId: undefined }
  const { error: e2 } = addDiscussionApiSchema.validate(v2)
  expect(e2?.details[0].message).toBe(err.ID_INVALID)

  const v3 = { ...DISCUSSION, postName: undefined }
  const { error: e3 } = addDiscussionApiSchema.validate(v3)
  expect(e3?.details[0].message).toBe(err.NAME_REQUIRED)
})
