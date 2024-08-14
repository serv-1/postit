import searchParamsToString from '.'

it('returns an empty string if there is no search params', () => {
  expect(searchParamsToString({})).toBe('')
})

it('returns the search params as a string', () => {
  expect(
    searchParamsToString({
      query: 'cat',
      categories: ['animal', 'pet'],
      price: '40',
    })
  ).toBe('query=cat&categories=animal&categories=pet&price=40')
})
