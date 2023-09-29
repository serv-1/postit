import { NAME_REQUIRED } from 'constants/errors'
import updateUserName from '.'

it('passes', () => {
  const result = updateUserName.validate({ name: 'bob' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const { error } = updateUserName.validate({})

  expect(error?.details[0].message).toBe(NAME_REQUIRED)
})
