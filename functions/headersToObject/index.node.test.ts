import headersToObject from '.'

it('returns Headers as a plain object', () => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-csrf-token': 'csrf-token',
  })

  expect(headersToObject(headers)).toEqual({
    'content-type': 'application/json',
    'x-csrf-token': 'csrf-token',
  })
})

it('returns an empty object for empty Headers', () => {
  const headers = new Headers()

  expect(headersToObject(headers)).toEqual({})
})
