import updateUserName from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = updateUserName.validate({ name: 'bob' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const { error } = updateUserName.validate({})

  expect(error?.details[0].message).toBe(err.NAME_REQUIRED)
})
