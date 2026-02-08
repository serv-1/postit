import getCommonItem from '.'

it('returns the common item of two arrays', () => {
  expect(getCommonItem([0, 1, 2], [4, 3, 2])).toBe(2)
})

it('returns undefined if there is no common item', () => {
  expect(getCommonItem([0, 1, 2], [3, 4, 5])).toBeUndefined()
})
