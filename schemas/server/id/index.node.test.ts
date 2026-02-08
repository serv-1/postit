/**
 * @jest-environment node
 */

import { Types } from 'mongoose'
import id from '.'
import { ID_INVALID } from 'constants/errors'

it('passes', () => {
  const result = id.validate(new Types.ObjectId().toString())

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it("fails if the value can't cast to an ObjectId", () => {
  const { error } = id.validate('oh no')

  expect(error?.details[0].message).toBe(ID_INVALID)
})
