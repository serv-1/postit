import addSpacesToNb from '../../utils/functions/addSpacesToNb'

it('returns the spaces separated integer', () => {
  const n = addSpacesToNb(123456789)
  expect(n).toBe('123 456 789')
})

it('returns the spaces separated floating point number', () => {
  const n = addSpacesToNb(123456.789)
  expect(n).toBe('123 456,789')
})
