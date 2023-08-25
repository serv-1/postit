import isImageTooBig from '.'

it('returns false if the file is not too big', () => {
  expect(isImageTooBig(10)).toBe(false)
})

it('returns true if the file is too big', () => {
  expect(isImageTooBig(1048577)).toBe(true)
})
