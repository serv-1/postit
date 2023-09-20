/**
 * @jest-environment node
 */

import Discussion from '.'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { type UserDoc } from 'models/User'
import Post, { type PostDoc } from 'models/Post'

jest.unmock('nanoid')

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
      const { messages } = await new Discussion({
        messages: [
          { message: 'yo', userId: new mongoose.Types.ObjectId() },
          { message: 'hi', userId: new mongoose.Types.ObjectId() },
        ],
        postName: 'table',
      }).save()

      expect(messages[0]).toHaveProperty('seen', false)
      expect(messages[1]).toHaveProperty('seen', false)
      expect(messages[0].createdAt.toISOString()).not.toBe(
        messages[1].createdAt.toISOString()
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

    it('adds its id to the post, the buyer and the seller', async () => {
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

      post = (await Post.findById(post._id).lean().exec()) as PostDoc
      buyer = (await User.findById(buyer._id).lean().exec()) as UserDoc
      seller = (await User.findById(seller._id).lean().exec()) as UserDoc

      const discId = discussion._id.toString()

      expect(buyer.discussionIds.map((id) => id.toString())).toContain(discId)
      expect(seller.discussionIds.map((id) => id.toString())).toContain(discId)
      expect(post.discussionIds.map((id) => id.toString())).toContain(discId)
      expect(seller).toHaveProperty('hasUnseenMessages', true)
    })
  })

  describe('when a discussion is deleted', () => {
    it('deletes its id from the post, the buyer and the seller', async () => {
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

      post = (await Post.findById(post._id).lean().exec()) as PostDoc
      buyer = (await User.findById(buyer._id).lean().exec()) as UserDoc
      seller = (await User.findById(seller._id).lean().exec()) as UserDoc

      expect(post.discussionIds).toHaveLength(0)
      expect(buyer.discussionIds).toHaveLength(0)
      expect(seller.discussionIds).toHaveLength(0)
      expect(seller).toHaveProperty('hasUnseenMessages', false)
    })

    it("doesn't set hasUnseenMessages of the seller to false if it has other discussions with unseen messages", async () => {
      let seller: UserDoc = await new User({
        name: 'jane',
        email: 'jane@test.com',
        password: 'jane password',
      }).save()

      const buyerId = new mongoose.Types.ObjectId()
      const discussion = await new Discussion({
        messages: [{ message: 'yo', userId: buyerId }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        sellerId: seller._id,
        buyerId,
      }).save()

      await new Discussion({
        messages: [{ message: 'hi', userId: buyerId }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        sellerId: seller._id,
        buyerId,
      }).save()

      await Discussion.deleteOne({ _id: discussion._id }).lean().exec()

      seller = (await User.findById(seller._id).lean().exec()) as UserDoc

      expect(seller.discussionIds.map((id) => id.toString())).not.toContain(
        discussion._id.toString()
      )
      expect(seller).toHaveProperty('hasUnseenMessages', true)
    })

    it("doesn't set hasUnseenMessages of the buyer to false if it has other discussions with unseen messages", async () => {
      let buyer: UserDoc = await new User({
        name: 'john',
        email: 'john@test.com',
        password: 'john password',
      }).save()

      const sellerId = new mongoose.Types.ObjectId()
      const discussion = await new Discussion({
        messages: [
          { message: 'yo', userId: buyer._id },
          { message: 'yo', userId: sellerId },
        ],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId,
      }).save()

      await new Discussion({
        messages: [
          { message: 'hi', userId: buyer._id },
          { message: 'hi', userId: sellerId },
        ],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId,
      }).save()

      await User.updateOne({ _id: buyer._id }, { hasUnseenMessages: true })
        .lean()
        .exec()

      await Discussion.deleteOne({ _id: discussion._id }).lean().exec()

      buyer = (await User.findById(buyer._id).lean().exec()) as UserDoc

      expect(buyer.discussionIds.map((id) => id.toString())).not.toContain(
        discussion._id.toString()
      )
      expect(buyer).toHaveProperty('hasUnseenMessages', true)
    })
  })
})
