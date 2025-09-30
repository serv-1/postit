/**
 * @jest-environment node
 */

import Discussion from '.'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { type UserDoc } from 'models/User'
import Post, { type PostDoc } from 'models/Post'

jest.unmock('nanoid').mock('libs/pusher/server')

describe('Discussion model', () => {
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()

    await mongoose.connect(mongoServer.getUri())
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await Discussion.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  describe('when a discussion is saved', () => {
    it('defines the default values', async () => {
      const d1 = await new Discussion({
        messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
        postName: 'table',
      }).save()

      const d2 = await new Discussion({
        messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
        postName: 'chair',
      }).save()

      expect(d1.messages[0]).toHaveProperty('seen', false)
      expect(d1.messages[0].createdAt).toBeInstanceOf(Date)
      expect(d1.channelName).toContain('private-encrypted-')
      expect(d1.messages[0].createdAt.toISOString()).not.toBe(
        d2.messages[0].createdAt.toISOString()
      )
    })

    it('generates a different channel name for each user', async () => {
      const d1 = await new Discussion({
        messages: [],
        postName: 'table',
      }).save()
      const d2 = await new Discussion({
        messages: [],
        postName: 'chair',
      }).save()

      expect(d1.channelName).not.toBe(d2.channelName)
    })

    it('adds itself to the post, the buyer and the seller', async () => {
      let buyer: UserDoc = await new User({
        name: 'john',
        email: 'john@test.com',
        password: 'john password',
      }).save()

      let seller: UserDoc = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
      }).save()

      let post: PostDoc = await new Post({
        name: 'table',
        description: 'I sell this table.',
        price: 40,
        categories: ['furniture'],
        images: ['table.jpeg'],
        userId: seller._id,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      const discussion = await new Discussion({
        messages: [],
        postName: post.name,
        postId: post._id,
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()

      post = (await Post.findById(post._id).lean().exec())!
      buyer = (await User.findById(buyer._id).lean().exec())!
      seller = (await User.findById(seller._id).lean().exec())!

      const discussionId = discussion._id.toString()

      expect(buyer.discussions[0].id.toString()).toBe(discussionId)
      expect(seller.discussions[0].id.toString()).toBe(discussionId)
      expect(seller.discussions[0].hasNewMessage).toBe(true)
      expect(post.discussionIds[0].toString()).toBe(discussionId)
    })
  })

  describe('when a discussion is deleted', () => {
    it('deletes itself from the post, the buyer and the seller', async () => {
      let buyer: UserDoc = await new User({
        name: 'john',
        email: 'john@test.com',
        password: 'john password',
      }).save()

      let seller: UserDoc = await new User({
        name: 'jane',
        email: 'jane@test.com',
        password: 'jane password',
      }).save()

      let post: PostDoc = await new Post({
        name: 'table',
        description: 'I sell this table.',
        price: 40,
        categories: ['furniture'],
        images: ['table.jpeg'],
        userId: seller._id,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      const discussion = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: post.name,
        postId: post._id,
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()

      await Discussion.deleteOne({ _id: discussion._id }).lean().exec()

      post = (await Post.findById(post._id).lean().exec())!
      buyer = (await User.findById(buyer._id).lean().exec())!
      seller = (await User.findById(seller._id).lean().exec())!

      expect(post.discussionIds).toHaveLength(0)
      expect(buyer.discussions).toHaveLength(0)
      expect(seller.discussions).toHaveLength(0)
    })
  })
})
