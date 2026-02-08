/**
 * @jest-environment node
 */

import { Types } from 'mongoose'
import createDiscussion from '.'
import { MESSAGE_REQUIRED, ID_INVALID, NAME_REQUIRED } from 'constants/errors'

it('passes', () => {
  const result = createDiscussion.validate({
    message: 'Hello, world!',
    postId: new Types.ObjectId(),
    sellerId: new Types.ObjectId(),
    postName: 'Table',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the message is undefined', () => {
  const { error } = createDiscussion.validate({
    postId: new Types.ObjectId(),
    sellerId: new Types.ObjectId(),
    postName: 'Table',
  })

  expect(error?.details[0].message).toBe(MESSAGE_REQUIRED)
})

it("fails if the seller's id is undefined", () => {
  const { error } = createDiscussion.validate({
    message: 'Hello, world!',
    postId: new Types.ObjectId(),
    postName: 'Table',
  })

  expect(error?.details[0].message).toBe(ID_INVALID)
})

it("fails if the post's id is undefined", () => {
  const { error } = createDiscussion.validate({
    message: 'Hello, world!',
    sellerId: new Types.ObjectId(),
    postName: 'Table',
  })

  expect(error?.details[0].message).toBe(ID_INVALID)
})

it("fails if the post's name is undefined", () => {
  const { error } = createDiscussion.validate({
    message: 'Hello, world!',
    postId: new Types.ObjectId(),
    sellerId: new Types.ObjectId(),
  })

  expect(error?.details[0].message).toBe(NAME_REQUIRED)
})
