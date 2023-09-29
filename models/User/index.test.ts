/**
 * @jest-environment node
 */

import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { type UserDoc } from '.'
import Account from 'models/Account'
import Post from 'models/Post'
import Discussion from 'models/Discussion'
// @ts-expect-error
import { mockDeleteImage } from 'functions/deleteImage'

jest
  .unmock('nanoid')
  .unmock('models/User')
  .mock('functions/deleteImage')
  .mock('functions/hashPassword')

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
      const john = (await User.findById(johnId).lean().exec()) as UserDoc

      expect(john.channelName).toBeTruthy()
      expect(john.hasUnseenMessages).toBe(false)
    })

    it('generates a different channel name for each one of them', async () => {
      const bob = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'bob password',
      }).save()

      const john = (await User.findById(johnId).lean().exec()) as UserDoc

      expect(john.channelName).not.toBe(bob.channelName)
    })

    it('encrypts its password', async () => {
      const john = (await User.findById(johnId).lean().exec()) as UserDoc

      expect(john.password).toBe('hashedpassword')
    })
  })

  describe('when a user is deleted', () => {
    it('deletes its image', async () => {
      const john = (await User.findByIdAndUpdate(johnId, { image: 'john.jpeg' })
        .lean()
        .exec()) as UserDoc

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

    describe('when its a buyer', () => {
      it('deletes a discussion if the seller has already deleted it', async () => {
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
          {
            $pull: {
              discussionIds: {
                $in: [tableDiscussion._id, chairDiscussion._id],
              },
            },
          }
        )

        await User.deleteOne({ _id: johnId }).lean().exec()

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

      it('deletes its id in all discussions in which it was', async () => {
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

        await User.deleteOne({ _id: johnId }).lean().exec()

        expect(
          await Discussion.findById(tableDiscussion._id).lean().exec()
        ).not.toHaveProperty('buyerId')
        expect(
          await Discussion.findById(chairDiscussion._id).lean().exec()
        ).not.toHaveProperty('buyerId')
      })

      it("doesn't delete a discussion if the seller didn't deleted it", async () => {
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

        await User.deleteOne({ _id: johnId }).lean().exec()

        expect(
          await Discussion.findById(tableDiscussion._id).lean().exec()
        ).not.toBeNull()
      })
    })

    describe('when its a seller', () => {
      it('deletes a discussion if the buyer has already deleted it', async () => {
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
          {
            $pull: {
              discussionIds: {
                $in: [tableDiscussion._id, chairDiscussion._id],
              },
            },
          }
        )
        await User.deleteOne({ _id: seller._id }).lean().exec()

        expect(
          await Discussion.findById(tableDiscussion._id).lean().exec()
        ).toBeNull()

        expect(
          await Discussion.findById(chairDiscussion._id).lean().exec()
        ).toBeNull()
      })

      it('deletes a discussion if the buyer has deleted its account', async () => {
        const tableDiscussion = await new Discussion({
          messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
          postName: 'table',
          postId: new mongoose.Types.ObjectId(),
          sellerId: johnId,
        }).save()

        const chairDiscussion = await new Discussion({
          messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
          postName: 'chair',
          postId: new mongoose.Types.ObjectId(),
          sellerId: johnId,
        }).save()

        await User.deleteOne({ _id: johnId }).lean().exec()

        expect(
          await Discussion.findById(tableDiscussion._id).lean().exec()
        ).toBeNull()

        expect(
          await Discussion.findById(chairDiscussion._id).lean().exec()
        ).toBeNull()
      })

      it('deletes its id in all discussions in which it was', async () => {
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

        await User.deleteOne({ _id: seller._id }).lean().exec()

        expect(
          await Discussion.findById(tableDiscussion._id).lean().exec()
        ).not.toHaveProperty('sellerId')

        expect(
          await Discussion.findById(chairDiscussion._id).lean().exec()
        ).not.toHaveProperty('sellerId')
      })

      it("doesn't delete a discussion if the buyer didn't deleted it", async () => {
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

        await User.deleteOne({ _id: seller._id }).lean().exec()

        expect(
          await Discussion.findById(tableDiscussion._id).lean().exec()
        ).not.toBeNull()
      })
    })
  })
})
