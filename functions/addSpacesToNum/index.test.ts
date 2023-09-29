import addSpacesToNum from '.'

it('returns the spaces separated integer', () => {
  expect(addSpacesToNum(123456789)).toBe('123 456 789')
})

it('returns the spaces separated floating point number', () => {
  expect(addSpacesToNum(123456.789)).toBe('123 456,789')
})
