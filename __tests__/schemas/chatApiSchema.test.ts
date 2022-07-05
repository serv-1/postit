import chatApiSchema from '../../schemas/chatApiSchema'
import err from '../../utils/constants/errors'

const VALUE = {
  message: {
    message: 'yo yo',
    createdAt: new Date().toISOString(),
    isBuyerMsg: true,
  },
  channelName: '0',
}

it('passes', () => {
  const result = chatApiSchema.validate(VALUE)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if a property is undefined', () => {
  const v1 = { ...VALUE, message: undefined }
  const { error: e1 } = chatApiSchema.validate(v1)
  expect(e1?.details[0].message).toBe(err.MESSAGE_REQUIRED)

  const v2 = { ...VALUE, channelName: undefined }
  const { error: e2 } = chatApiSchema.validate(v2)
  expect(e2?.details[0].message).toBe(err.CHANNEL_NAME_REQUIRED)
})
