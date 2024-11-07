/**
 * @jest-environment node
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import Token from '.'
import mongoose from 'mongoose'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('when a token is saved', () => {
  it('defines the default values', async () => {
    const token = await new Token({
      userId: new mongoose.Types.ObjectId(),
      token: 'token',
    }).save()

    expect(token.createdAt).not.toBeUndefined()
  })
})

it('deletes a token 3 minutes after its creation', async () => {
  await new Token({
    userId: new mongoose.Types.ObjectId(),
    token: 'token',
  }).save()

  const indexes = await Token.listIndexes()

  expect(indexes[1].expireAfterSeconds).toBe(180)
})
