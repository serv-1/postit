import addDiscussionApiSchema from '../../schemas/addDiscussionApiSchema'
import err from '../../utils/constants/errors'

const DISCUSSION = {
  message: 'Hello, world!',
  postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  sellerId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  postName: 'Table',
}

it('passes', () => {
  const result = addDiscussionApiSchema.validate(DISCUSSION)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if message, postId, sellerId or postName are undefined', () => {
  const v1 = { ...DISCUSSION, postId: undefined }
  const { error: e1 } = addDiscussionApiSchema.validate(v1)
  expect(e1?.details[0].message).toBe(err.ID_INVALID)

  const v2 = { ...DISCUSSION, sellerId: undefined }
  const { error: e2 } = addDiscussionApiSchema.validate(v2)
  expect(e2?.details[0].message).toBe(err.ID_INVALID)

  const v3 = { ...DISCUSSION, postName: undefined }
  const { error: e3 } = addDiscussionApiSchema.validate(v3)
  expect(e3?.details[0].message).toBe(err.NAME_REQUIRED)

  const v4 = { ...DISCUSSION, message: undefined }
  const { error: e4 } = addDiscussionApiSchema.validate(v4)
  expect(e4?.details[0].message).toBe(err.MESSAGE_REQUIRED)
})
