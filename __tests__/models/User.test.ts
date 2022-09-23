/**
 * @jest-environment node
 */

import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { UserModel } from '../../models/User'
import Account, { AccountModel } from '../../models/Account'
import Post, { PostModel } from '../../models/Post'
import Discussion from '../../models/Discussion'

jest.unmock('nanoid')

describe('User model', () => {
  const scryptSync = jest.spyOn(require('crypto'), 'scryptSync')

  const user = {
    name: 'john',
    email: 'john@test.com',
    password: 'john password',
  }

  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  beforeEach(async () => {
    scryptSync.mockImplementation((pw) => Buffer.from(pw as string, 'utf-8'))
    await new User(user).save()
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

  it('defines the default values', async () => {
    const savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    expect(savedUser.channelName).toBeTruthy()
    expect(savedUser.hasUnseenMessages).toBe(false)
  })

  it('encrypts the password', async () => {
    const savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    const [salt, hash] = (savedUser.password as string).split(':')

    expect(salt).toBeTruthy()
    expect(hash).toBeTruthy()

    expect(hash).not.toBe(user.password)
  })

  it('generates a different channel name for each user', async () => {
    const user2 = { ...user, email: 'john@testing.com' }
    const savedUser2 = await new User(user2).save()

    const savedUser1 = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    expect(savedUser1.channelName).not.toBe(savedUser2.channelName)
  })

  it('deletes its account and its posts', async () => {
    const savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    const account: Omit<AccountModel, '_id'> = {
      type: 'abc',
      provider: 'abc',
      providerAccountId: 'abc',
      refresh_token: 'abc',
      scope: 'abc',
      id_token: 'abc',
      userId: savedUser._id,
      oauth_token_secret: 'abc',
      oauth_token: 'abc',
      session_state: 'abc',
    }

    const posts: Omit<PostModel, '_id'>[] = [
      {
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table.jpeg'],
        userId: savedUser._id,
        address: 'Paris, France',
        latLon: [42, 58],
        discussionsIds: [],
      },
      {
        name: 'chair',
        description: 'I sell this chair.',
        categories: ['furniture'],
        price: 20,
        images: ['chair.jpeg'],
        userId: savedUser._id,
        address: 'Paris, France',
        latLon: [42, 58],
        discussionsIds: [],
      },
    ]

    await new Account(account).save()
    await new Post(posts[0]).save()
    await new Post(posts[1]).save()

    await User.deleteOne({ _id: savedUser._id }).lean().exec()

    const savedAccount = await Account.findOne({ userId: savedUser._id })
      .lean()
      .exec()
    const savedPosts = await Post.find({ userId: savedUser._id }).lean().exec()

    expect(savedAccount).toBeNull()
    expect(savedPosts).toHaveLength(0)
  })

  describe('When the buyer is deleted', () => {
    it('deletes the discussions where the seller has deleted the discussion', async () => {
      const user2 = { ...user, email: 'jane@test.com' }
      await new User(user2).save()

      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserModel
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserModel

      const discussion1 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()
      const discussion2 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()

      await User.updateOne(
        { _id: seller._id },
        {
          $pull: {
            discussionsIds: { $in: [discussion1._id, discussion2._id] },
          },
        }
      )

      await User.deleteOne({ _id: buyer._id }).lean().exec()

      const savedDiscussion1 = await Discussion.findById(discussion1._id)
        .lean()
        .exec()
      const savedDiscussion2 = await Discussion.findById(discussion2._id)
        .lean()
        .exec()

      expect(savedDiscussion1).toBeNull()
      expect(savedDiscussion2).toBeNull()
    })

    it('deletes the discussions where the seller has deleted its account', async () => {
      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserModel

      const discussion1 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
      }).save()
      const discussion2 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
      }).save()

      await User.deleteOne({ _id: buyer._id }).lean().exec()

      const savedDiscussion1 = await Discussion.findById(discussion1._id)
        .lean()
        .exec()
      const savedDiscussion2 = await Discussion.findById(discussion2._id)
        .lean()
        .exec()

      expect(savedDiscussion1).toBeNull()
      expect(savedDiscussion2).toBeNull()
    })

    it('deletes its id in the other discussions in which it was', async () => {
      const user2 = { ...user, email: 'jane@test.com' }
      await new User(user2).save()

      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserModel
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserModel

      const discussion1 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()
      const discussion2 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: buyer._id }).lean().exec()

      const savedDiscussion1 = await Discussion.findById(discussion1._id)
        .lean()
        .exec()
      const savedDiscussion2 = await Discussion.findById(discussion2._id)
        .lean()
        .exec()

      expect(savedDiscussion1).not.toHaveProperty('buyerId')
      expect(savedDiscussion2).not.toHaveProperty('buyerId')
    })
  })

  describe('When the seller is deleted', () => {
    it('deletes the discussions where the buyer has deleted the discussion', async () => {
      const user2 = { ...user, email: 'jane@test.com' }
      await new User(user2).save()

      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserModel
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserModel

      const discussion1 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()
      const discussion2 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()

      await User.updateOne(
        { _id: buyer._id },
        {
          $pull: {
            discussionsIds: { $in: [discussion1._id, discussion2._id] },
          },
        }
      )

      await User.deleteOne({ _id: seller._id }).lean().exec()

      const savedDiscussion1 = await Discussion.findById(discussion1._id)
        .lean()
        .exec()
      const savedDiscussion2 = await Discussion.findById(discussion2._id)
        .lean()
        .exec()

      expect(savedDiscussion1).toBeNull()
      expect(savedDiscussion2).toBeNull()
    })

    it('deletes the discussions where the buyer has deleted its account', async () => {
      const seller = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserModel

      const discussion1 = await new Discussion({
        messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        sellerId: seller._id,
      }).save()
      const discussion2 = await new Discussion({
        messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: seller._id }).lean().exec()

      const savedDiscussion1 = await Discussion.findById(discussion1._id)
        .lean()
        .exec()
      const savedDiscussion2 = await Discussion.findById(discussion2._id)
        .lean()
        .exec()

      expect(savedDiscussion1).toBeNull()
      expect(savedDiscussion2).toBeNull()
    })

    it('deletes its id in the other discussions in which it was', async () => {
      const user2 = { ...user, email: 'jane@test.com' }
      await new User(user2).save()

      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserModel
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserModel

      const discussion1 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'table',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()
      const discussion2 = await new Discussion({
        messages: [{ message: 'yo', userId: buyer._id }],
        postName: 'chair',
        postId: new mongoose.Types.ObjectId(),
        buyerId: buyer._id,
        sellerId: seller._id,
      }).save()

      await User.deleteOne({ _id: seller._id }).lean().exec()

      const savedDiscussion1 = await Discussion.findById(discussion1._id)
        .lean()
        .exec()
      const savedDiscussion2 = await Discussion.findById(discussion2._id)
        .lean()
        .exec()

      expect(savedDiscussion1).not.toHaveProperty('sellerId')
      expect(savedDiscussion2).not.toHaveProperty('sellerId')
    })
  })
})
