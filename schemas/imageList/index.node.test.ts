import { MAX_IMAGE_SIZE } from 'constants/index'
import imageList from '.'
import {
  IMAGES_INVALID,
  IMAGES_MAX,
  IMAGE_INVALID,
  IMAGE_TOO_BIG,
} from 'constants/errors'

it('passes', () => {
  const result = imageList.validate({
    0: new File(['data'], '0.jpeg', { type: 'image/jpeg' }),
    1: new File(['data'], '1.jpeg', { type: 'image/jpeg' }),
    length: 2,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('returns an array of images', () => {
  const arrayLike = {
    0: new File(['data'], '0.jpeg', { type: 'image/jpeg' }),
    1: new File(['data'], '1.jpeg', { type: 'image/jpeg' }),
    length: 2,
  }

  const result = imageList.validate(arrayLike)

  expect(result.value).toStrictEqual([arrayLike[0], arrayLike[1]])
})

it('fails if the value is not an object', () => {
  const { error } = imageList.validate('oh no')

  expect(error?.details[0].message).toBe(IMAGES_INVALID)
})

it('fails if there are more than 5 images', () => {
  const { error } = imageList.validate({
    0: new File(['data'], '0.jpeg', { type: 'image/jpeg' }),
    1: new File(['data'], '1.jpeg', { type: 'image/jpeg' }),
    2: new File(['data'], '2.jpeg', { type: 'image/jpeg' }),
    3: new File(['data'], '3.jpeg', { type: 'image/jpeg' }),
    4: new File(['data'], '4.jpeg', { type: 'image/jpeg' }),
    5: new File(['data'], '5.jpeg', { type: 'image/jpeg' }),
    length: 6,
  })

  expect(error?.details[0].message).toBe(IMAGES_MAX)
})

it('fails if an image is invalid', () => {
  const { error } = imageList.validate({
    0: new File(['data'], '0.jpeg', { type: 'image/jpeg' }),
    1: new File(['data'], '1.txt', { type: 'text/plain' }),
    length: 2,
  })

  expect(error?.details[0].message).toBe(IMAGE_INVALID)
})

it('fails if an image is too big', () => {
  const { error } = imageList.validate({
    0: new File(['data'], '0.jpeg', { type: 'image/jpeg' }),
    1: new File([new Uint8Array(MAX_IMAGE_SIZE + 1).toString()], '1.jpeg', {
      type: 'image/jpeg',
    }),
    length: 2,
  })

  expect(error?.details[0].message).toBe(IMAGE_TOO_BIG)
})
