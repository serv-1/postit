import isImageTooBig from '../../utils/functions/isImageTooBig'

it('returns false if the file is not too big', () => {
  const result = isImageTooBig(10)
  expect(result).toBe(false)
})

it('returns true if the file is too big', () => {
  const result = isImageTooBig(1048577)
  expect(result).toBe(true)
})
