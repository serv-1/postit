import err from '../../utils/constants/errors'
import isImageValid from '../../utils/functions/isImageValid'

it("returns an error message if the image isn't an image", () => {
  const notImage = new File(['data'], 'text.txt', { type: 'text/plain' })

  const result = isImageValid(notImage)

  expect(result).toBe(err.IMAGE_INVALID)
})

it('returns an error message if the image is too big', () => {
  const tooBigImage = new File([new ArrayBuffer(1000001)], 'img.jpeg', {
    type: 'image/jpeg',
  })

  const result = isImageValid(tooBigImage)

  expect(result).toBe(err.IMAGE_TOO_BIG)
})

it('returns undefined if the image is valid', () => {
  const image = new File(['image'], 'img.jpeg', { type: 'image/jpeg' })

  const result = isImageValid(image)

  expect(result).toBeUndefined()
})
