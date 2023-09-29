import { PRICE_INVALID } from 'constants/errors'
import updatePost from '.'

it('passes', () => {
  const result = updatePost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    address: 'Oslo, Norway',
    images: {
      0: new File(['data'], 'img.jpg', { type: 'image/jpeg' }),
      length: 1,
    },
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the name to be an empty string', () => {
  const result = updatePost.validate({ name: '' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the description to be an empty string', () => {
  const result = updatePost.validate({ description: '' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the price to be an empty string', () => {
  const result = updatePost.validate({ price: '' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the address to be an empty string', () => {
  const result = updatePost.validate({ address: '' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the price is less than 1', () => {
  const { error } = updatePost.validate({ price: 0 })

  expect(error?.details[0].message).toBe(PRICE_INVALID)
})
