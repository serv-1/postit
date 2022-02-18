import addCommasToNb from '../../utils/functions/addCommasToNb'

it('returns the commas separated integer', () => {
  const n = addCommasToNb(123456789)
  expect(n).toBe('123,456,789')
})

it('returns the commas separated floating point number', () => {
  const n = addCommasToNb(123456.789)
  expect(n).toBe('123,456.789')
})
