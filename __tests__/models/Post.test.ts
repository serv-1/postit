/**
 * @jest-environment node
 */

import Post from '../../models/Post'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { UserModel } from '../../models/User'
import Discussion, { DiscussionModel } from '../../models/Discussion'

jest.unmock('nanoid')

describe('Post Model', () => {
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
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it("adds the created post's id to its author", async () => {
    let savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    const post = await new Post({
      name: 'table',
      description: 'I sell this table.',
      categories: ['furniture'],
      price: 40,
      images: ['table.jpeg'],
      userId: savedUser._id,
      address: 'Paris, France',
      latLon: [42, 58],
    }).save()

    savedUser = (await User.findById(savedUser._id).lean().exec()) as UserModel
    const postsIds = savedUser.postsIds.map((id) => id.toString())

    expect(postsIds).toContain(post._id.toString())
  })

  it("deletes the deleted post's id from the author", async () => {
    let savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    const post = await new Post({
      name: 'table',
      description: 'I sell this table.',
      categories: ['furniture'],
      price: 40,
      images: ['table.jpeg'],
      userId: savedUser._id,
      address: 'Paris, France',
      latLon: [42, 58],
    }).save()

    await Post.deleteOne({ _id: post._id }).lean().exec()

    savedUser = (await User.findById(savedUser._id).lean().exec()) as UserModel

    expect(savedUser.postsIds).toHaveLength(0)
  })

  it("deletes the deleted post's id from the favorite posts ids of any users", async () => {
    let savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    const post = await new Post({
      name: 'table',
      description: 'I sell this table.',
      categories: ['furniture'],
      price: 40,
      images: ['table.jpeg'],
      userId: savedUser._id,
      address: 'Paris, France',
      latLon: [42, 58],
    }).save()

    const user1 = await new User({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'bob password',
      favPostsIds: [post._id],
    }).save()

    const user2 = await new User({
      name: 'Mike',
      email: 'mike@test.com',
      password: 'mike password',
      favPostsIds: [post._id],
    }).save()

    await Post.deleteOne({ _id: post._id }).lean().exec()

    const savedUser1 = (await User.findById(user1._id)
      .lean()
      .exec()) as UserModel
    const savedUser2 = (await User.findById(user2._id)
      .lean()
      .exec()) as UserModel

    expect(savedUser1.favPostsIds).toHaveLength(0)
    expect(savedUser2.favPostsIds).toHaveLength(0)
  })

  it("deletes the deleted post's id in each discussions in which it was", async () => {
    let savedUser = (await User.findOne({ email: user.email })
      .lean()
      .exec()) as UserModel

    const post = await new Post({
      name: 'table',
      description: 'I sell this table.',
      categories: ['furniture'],
      price: 40,
      images: ['table.jpeg'],
      userId: savedUser._id,
      address: 'Paris, France',
      latLon: [42, 58],
    }).save()

    const discussion1 = await new Discussion({
      messages: [],
      postName: post.name,
      postId: post._id,
      buyerId: savedUser._id,
    }).save()
    const discussion2 = await new Discussion({
      messages: [],
      postName: post.name,
      postId: post._id,
      sellerId: savedUser._id,
    }).save()

    await Post.deleteOne({ _id: post._id }).lean().exec()

    const savedDiscussion1 = (await Discussion.findById(discussion1._id)
      .lean()
      .exec()) as DiscussionModel
    const savedDiscussion2 = (await Discussion.findById(discussion2._id)
      .lean()
      .exec()) as DiscussionModel

    expect(savedDiscussion1).not.toHaveProperty('postId')
    expect(savedDiscussion2).not.toHaveProperty('postId')
  })
})
