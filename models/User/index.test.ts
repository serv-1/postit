/**
 * @jest-environment node
 */

import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '.'
import Account from 'models/Account'
import Post from 'models/Post'
import Discussion from 'models/Discussion'
// @ts-expect-error
import { mockDeleteImage } from 'functions/deleteImage'
// @ts-expect-error
import { mockPusherTrigger } from 'libs/pusher/server'

jest
  .unmock('nanoid')
  .unmock('models/User')
  .mock('functions/deleteImage')
  .mock('functions/hash')
  .mock('libs/pusher/server')

describe('User model', () => {
  let johnId: Types.ObjectId
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()

    await mongoose.connect(mongoServer.getUri())
  })

  beforeEach(async () => {
    const { _id } = await new User({
      name: 'john',
      email: 'john@test.com',
      password: 'password',
    }).save()

    johnId = _id
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await Account.deleteMany({})
    await Discussion.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  describe('when a user is saved', () => {
    it('defines the default values', async () => {
      const john = (await User.findById(johnId).lean().exec())!

      expect(john.channelName).toContain('private-encrypted-')
    })

    it('generates a different channel name for each one of them', async () => {
      const bob = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'bob password',
      }).save()

      const john = (await User.findById(johnId).lean().exec())!

      expect(john.channelName).not.toBe(bob.channelName)
    })

    it('encrypts its password', async () => {
      const john = (await User.findById(johnId).lean().exec())!

      expect(john.password).toBe('salt:password')
    })
  })

  describe('when a user is deleted', () => {
    it('deletes its image', async () => {
      const john = (await User.findByIdAndUpdate(johnId, { image: 'john.jpeg' })
        .lean()
        .exec())!

      await User.deleteOne({ _id: john._id }).lean().exec()

      expect(mockDeleteImage).toHaveBeenNthCalledWith(1, 'john.jpeg')
    })

    it('deletes its account', async () => {
      await new Account({
        type: 'abc',
        provider: 'abc',
        providerAccountId: 'abc',
        refresh_token: 'abc',
        scope: 'abc',
        id_token: 'abc',
        userId: johnId,
        oauth_token_secret: 'abc',
        oauth_token: 'abc',
        session_state: 'abc',
      }).save()

      await User.deleteOne({ _id: johnId }).lean().exec()

      const account = await Account.findOne({ userId: johnId }).lean().exec()

      expect(account).toBeNull()
    })

    it('deletes its posts', async () => {
      await new Post({
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table.jpeg'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
        discussionIds: [],
      }).save()

      await new Post({
        name: 'chair',
        description: 'I sell this chair.',
        categories: ['furniture'],
        price: 20,
        images: ['chair.jpeg'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
        discussionIds: [],
      }).save()

      await User.deleteOne({ _id: johnId }).lean().exec()

      const posts = await Post.find({ userId: johnId }).lean().exec()

      expect(posts).toHaveLength(0)
    })

    it('deletes a discussion if the buyer has deleted its account', async () => {
      const seller = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
      }).save()

      const tableDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        sellerId: seller._id,
      }).save()

      const chairDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: seller._id }).lean().exec()

      expect(
        await Discussion.findById(tableDiscussion._id).lean().exec()
      ).toBeNull()

      expect(
        await Discussion.findById(chairDiscussion._id).lean().exec()
      ).toBeNull()
    })

    it('deletes a discussion if the seller has deleted its account', async () => {
      const tableDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
      }).save()

      const chairDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
      }).save()

      await User.deleteOne({ _id: johnId }).lean().exec()

      expect(
        await Discussion.findById(tableDiscussion._id).lean().exec()
      ).toBeNull()
      expect(
        await Discussion.findById(chairDiscussion._id).lean().exec()
      ).toBeNull()
    })

    it('deletes a discussion if the buyer has hidden it', async () => {
      const seller = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
      }).save()

      const tableDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      const chairDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      await User.updateOne(
        { _id: johnId },
        { $set: { 'discussions.$[].hidden': true } }
      )

      await User.deleteOne({ _id: seller._id }).lean().exec()

      expect(
        await Discussion.findById(tableDiscussion._id).lean().exec()
      ).toBeNull()

      expect(
        await Discussion.findById(chairDiscussion._id).lean().exec()
      ).toBeNull()
    })

    it('deletes a discussion if the seller has hidden it', async () => {
      const seller = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
      }).save()

      const tableDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      const chairDiscussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      await User.updateOne(
        { _id: seller._id },
        { $set: { 'discussions.$[].hidden': true } }
      )

      await User.deleteOne({ _id: johnId }).lean().exec()

      expect(
        await Discussion.findById(tableDiscussion._id).lean().exec()
      ).toBeNull()
      expect(
        await Discussion.findById(chairDiscussion._id).lean().exec()
      ).toBeNull()
    })

    it("removes the buyer from the discussion if the seller hasn't hidden it", async () => {
      const seller = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
      }).save()

      const tableDiscussion = await new Discussion({
        messages: [
          { message: 'yo', userId: johnId },
          { message: 'hi', userId: seller._id },
        ],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      const chairDiscussion = await new Discussion({
        messages: [
          { message: 'yo', userId: johnId },
          { message: 'hi', userId: seller._id },
        ],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: johnId }).lean().exec()

      const updatedTableDiscussion = (await Discussion.findById(
        tableDiscussion._id
      )
        .lean()
        .exec())!

      const updatedChairDiscussion = (await Discussion.findById(
        chairDiscussion._id
      )
        .lean()
        .exec())!

      expect(updatedTableDiscussion).not.toHaveProperty('buyerId')
      expect(updatedTableDiscussion.messages[0]).not.toHaveProperty('userId')
      expect(updatedTableDiscussion.messages[1]).toHaveProperty('userId')

      expect(updatedChairDiscussion).not.toHaveProperty('buyerId')
      expect(updatedChairDiscussion.messages[0]).not.toHaveProperty('userId')
      expect(updatedChairDiscussion.messages[1]).toHaveProperty('userId')
    })

    it("removes the seller from the discussion if the buyer hasn't hidden it", async () => {
      const seller = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
      }).save()

      const tableDiscussion = await new Discussion({
        messages: [
          { message: 'yo', userId: johnId },
          { message: 'hi', userId: seller._id },
        ],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      const chairDiscussion = await new Discussion({
        messages: [
          { message: 'yo', userId: johnId },
          { message: 'hi', userId: seller._id },
        ],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: seller._id }).lean().exec()

      const updatedTableDiscussion = (await Discussion.findById(
        tableDiscussion._id
      )
        .lean()
        .exec())!

      const updatedChairDiscussion = (await Discussion.findById(
        chairDiscussion._id
      )
        .lean()
        .exec())!

      expect(updatedTableDiscussion).not.toHaveProperty('sellerId')
      expect(updatedTableDiscussion.messages[0]).toHaveProperty('userId')
      expect(updatedTableDiscussion.messages[1]).not.toHaveProperty('userId')

      expect(updatedChairDiscussion).not.toHaveProperty('sellerId')
      expect(updatedChairDiscussion.messages[0]).toHaveProperty('userId')
      expect(updatedChairDiscussion.messages[1]).not.toHaveProperty('userId')
    })

    it("triggers an 'interlocutor:deleted' event if the interlocutor hasn't hidden the discussion", async () => {
      const seller = await new User({
        name: 'jane',
        email: 'jane@test.com',
        password: 'password',
      }).save()

      const discussion = await new Discussion({
        messages: [{ message: 'yo', userId: johnId }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: johnId,
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: seller._id }).lean().exec()

      expect(mockPusherTrigger).toHaveBeenNthCalledWith(
        1,
        discussion.channelName,
        'interlocutor:deleted',
        null
      )
    })
  })
})
