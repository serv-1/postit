import updatePostApiSchema from '../../schemas/updatePostApiSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = updatePostApiSchema.validate({
    address: 'Paris',
    latLon: [17, 58],
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if latLon is missing with address', () => {
  const { error: e } = updatePostApiSchema.validate({ address: 'Paris' })
  expect(e?.details[0].message).toBe(err.ADDRESS_INVALID)
})

it('fails if a property is missing', () => {
  const { error: e } = updatePostApiSchema.validate({})
  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})
