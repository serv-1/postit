import isImage from '../../utils/functions/isImage'

it('returns false if the file is not an image', () => {
  const result = isImage('text/plain')
  expect(result).toBe(false)
})

it('returns true if the file is an image', () => {
  const result = isImage('image/jpeg')
  expect(result).toBe(true)
})
