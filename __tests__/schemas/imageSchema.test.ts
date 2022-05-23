import imageSchema from '../../schemas/imageSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = imageSchema.validate({ base64: 'ad0=', ext: 'jpg' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

describe('fails if the value', () => {
  it('is not an object', () => {
    const { error: e } = imageSchema.validate(1)
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })

  it('has an unknown property', () => {
    const image = { base64: 'ad0=', ext: 'jpg', a: 0 }
    const { error: e } = imageSchema.validate(image)
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })
})

describe('fails if the base64 property', () => {
  it('is not a string', () => {
    const { error: e } = imageSchema.validate({ base64: 1, ext: 'jpg' })
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })

  it('is undefined', () => {
    const { error: e } = imageSchema.validate({ ext: 'jpg' })
    expect(e?.details[0].message).toBe(err.IMAGE_REQUIRED)
  })

  it('is an empty string', () => {
    const { error: e } = imageSchema.validate({ base64: '', ext: 'jpg' })
    expect(e?.details[0].message).toBe(err.IMAGE_REQUIRED)
  })

  it('is not a base64 string', () => {
    const { error: e } = imageSchema.validate({ base64: 'no', ext: 'jpg' })
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })
})

describe('fails if the ext property', () => {
  it('is not a string', () => {
    const { error: e } = imageSchema.validate({ base64: 'ad0=', ext: 1 })
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })

  it('is an empty string', () => {
    const { error: e } = imageSchema.validate({ base64: 'ad0=', ext: '' })
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })

  it('is undefined', () => {
    const { error: e } = imageSchema.validate({ base64: 'ad0=' })
    expect(e?.details[0].message).toBe(err.IMAGE_REQUIRED)
  })

  it('is not a valid image file extension', () => {
    const { error: e } = imageSchema.validate({ base64: 'ad0=', ext: 'no' })
    expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
  })
})
