import isImage from '.'

it('returns false if the file is not an image', () => {
  expect(isImage('text/plain')).toBe(false)
})

it('returns true if the file is an image', () => {
  expect(isImage('image/jpeg')).toBe(true)
})
