import formatToUrl from '.'

it('returns the string formatted', () => {
  expect(formatToUrl('yès, of çôursë!')).toBe('yes-of-course')
})
