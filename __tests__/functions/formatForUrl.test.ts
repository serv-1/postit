import formatForUrl from '../../utils/functions/formatForUrl'

it('returns the string formatted', () => {
  const strToFormat = 'yes, of course!'

  const result = formatForUrl(strToFormat)

  expect(result).toBe('yes-of-course')
})
