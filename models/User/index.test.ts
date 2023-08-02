/**
 * @jest-environment node
 */

import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { UserDoc } from '.'
import Account, { AccountModel } from 'models/Account'
import Post, { PostModel } from 'models/Post'
import Discussion from 'models/Discussion'
// @ts-expect-error
import { mockDeleteImage } from 'utils/functions/deleteImage'

jest
  .unmock('nanoid')
  .unmock('models/User')
  .mock('utils/functions/deleteImage')
  .mock('utils/functions/hashPassword')

describe('User model', () => {
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
      .exec()) as UserDoc

    expect(savedUser.channelName).toBeTruthy()
    expect(savedUser.hasUnseenMessages).toBe(false)
  })

  it("encrypts the user's the password", async () => {
    const savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserDoc

    expect(savedUser.password).toBe('hashed' + user.password)
  })

  it('generates a different channel name for each user', async () => {
    const user2 = { ...user, email: 'john@testing.com' }
    const savedUser2 = await new User(user2).save()
    const savedUser1 = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserDoc

    expect(savedUser1.channelName).not.toBe(savedUser2.channelName)
  })

  it("deletes the user's image", async () => {
    const savedUser = (await User.findOneAndUpdate(
      { email: user.email },
      { image: 'john.jpeg' }
    )
      .lean()
      .exec()) as UserDoc

    await User.deleteOne({ _id: savedUser._id }).lean().exec()

    expect(mockDeleteImage).toHaveBeenNthCalledWith(1, 'john.jpeg')
  })

  it("deletes the user's account", async () => {
    const savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserDoc
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

    await new Account(account).save()
    await User.deleteOne({ _id: savedUser._id }).lean().exec()

    const savedAccount = await Account.findOne({ userId: savedUser._id })
      .lean()
      .exec()

    expect(savedAccount).toBeNull()
  })

  it("deletes the user's posts", async () => {
    const savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserDoc
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

    await new Post(posts[0]).save()
    await new Post(posts[1]).save()
    await User.deleteOne({ _id: savedUser._id }).lean().exec()

    const savedPosts = await Post.find({ userId: savedUser._id }).lean().exec()

    expect(savedPosts).toHaveLength(0)
  })

  describe('When the buyer has deleted its account', () => {
    it('deletes the discussions where the seller has deleted the discussion', async () => {
      const user2 = { ...user, email: 'jane@test.com' }

      await new User(user2).save()

      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserDoc
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserDoc
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
        .exec()) as UserDoc
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
        .exec()) as UserDoc
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserDoc
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

  describe('When the seller has deleted its account', () => {
    it('deletes the discussions where the buyer has deleted the discussion', async () => {
      const user2 = { ...user, email: 'jane@test.com' }

      await new User(user2).save()

      const buyer = (await User.findOne({ email: user.email })
        .lean()
        .exec()) as UserDoc
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserDoc
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
        .exec()) as UserDoc
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
        .exec()) as UserDoc
      const seller = (await User.findOne({ email: user2.email })
        .lean()
        .exec()) as UserDoc
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
