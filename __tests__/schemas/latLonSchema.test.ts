import latLonSchema from '../../schemas/latLonSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = latLonSchema.validate([15, 28])
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an array', () => {
  const { error: e } = latLonSchema.validate('')
  expect(e?.details[0].message).toBe(err.LATLON_INVALID)
})

it('fails if the value is not latitude/longitude', () => {
  const { error: e1 } = latLonSchema.validate([1])
  expect(e1?.details[0].message).toBe(err.LATLON_INVALID)

  const { error: e2 } = latLonSchema.validate([1, 1, 1])
  expect(e2?.details[0].message).toBe(err.LATLON_INVALID)

  const { error: e3 } = latLonSchema.validate([])
  expect(e3?.details[0].message).toBe(err.LATLON_INVALID)
})
