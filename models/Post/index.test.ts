/**
 * @jest-environment node
 */

import Post from '.'
import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { type UserDoc } from 'models/User'
import Discussion from 'models/Discussion'
// @ts-expect-error
import { mockDeleteImage } from 'functions/deleteImage'

jest.unmock('nanoid').mock('functions/deleteImage')

describe('Post model', () => {
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
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  describe('when a post is saved', () => {
    it('adds its id to its author', async () => {
      const table = await new Post({
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table.jpeg'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      const { postIds } = (await User.findById(johnId).lean().exec())!

      expect(postIds.map((id) => id.toString())).toContain(table._id.toString())
    })
  })

  describe('when a post is deleted', () => {
    it('deletes its id from its author', async () => {
      const table = await new Post({
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table.jpeg'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      await Post.deleteOne({ _id: table._id }).lean().exec()

      const { postIds } = (await User.findById(johnId).lean().exec())!

      expect(postIds).toHaveLength(0)
    })

    it('deletes its id from the favorite post ids of any users', async () => {
      const table = await new Post({
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table.jpeg'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      let bob: UserDoc = await new User({
        name: 'bob',
        email: 'bob@test.com',
        password: 'password',
        favPostsIds: [table._id],
      }).save()

      let mike: UserDoc = await new User({
        name: 'mike',
        email: 'mike@test.com',
        password: 'password',
        favPostsIds: [table._id],
      }).save()

      await Post.deleteOne({ _id: table._id }).lean().exec()

      bob = (await User.findById(bob._id).lean().exec())!
      mike = (await User.findById(mike._id).lean().exec())!

      expect(bob.favPostIds).toHaveLength(0)
      expect(mike.favPostIds).toHaveLength(0)
    })

    it('deletes its images', async () => {
      const post = await new Post({
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table1', 'table2'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      await Post.deleteOne({ _id: post._id }).lean().exec()

      expect(mockDeleteImage).toHaveBeenCalledTimes(2)
      expect(mockDeleteImage.mock.calls[0][0]).toBe('table1')
      expect(mockDeleteImage.mock.calls[1][0]).toBe('table2')
    })

    it('deletes its id in each discussions in which it was', async () => {
      const post = await new Post({
        name: 'table',
        description: 'I sell this table.',
        categories: ['furniture'],
        price: 40,
        images: ['table.jpeg'],
        userId: johnId,
        address: 'Paris, France',
        latLon: [42, 58],
      }).save()

      const discussion1 = await new Discussion({
        messages: [],
        postName: post.name,
        postId: post._id,
        buyerId: johnId,
      }).save()

      const discussion2 = await new Discussion({
        messages: [],
        postName: post.name,
        postId: post._id,
        sellerId: johnId,
      }).save()

      await Post.deleteOne({ _id: post._id }).lean().exec()

      expect(
        await Discussion.findById(discussion1._id).lean().exec()
      ).not.toHaveProperty('postId')
      expect(
        await Discussion.findById(discussion2._id).lean().exec()
      ).not.toHaveProperty('postId')
    })
  })
})
