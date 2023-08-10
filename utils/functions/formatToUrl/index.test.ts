import formatToUrl from 'utils/functions/formatToUrl'

it('returns the string formatted', () => {
  const result = formatToUrl('yès, of çôursë!')

  expect(result).toBe('yes-of-course')
})
