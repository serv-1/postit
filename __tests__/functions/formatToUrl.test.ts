import formatToUrl from '../../utils/functions/formatToUrl'

it('returns the string formatted', () => {
  const strToFormat = 'yès, of çôursë!'

  const result = formatToUrl(strToFormat)

  expect(result).toBe('yes-of-course')
})
