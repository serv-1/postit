/**
 * @jest-environment node
 */

import Discussion, { MessageModel } from '../../models/Discussion'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User, { UserModel } from '../../models/User'
import Post, { PostModel } from '../../models/Post'

jest.unmock('nanoid')

describe('Discussion Model', () => {
  const scryptSync = jest.spyOn(require('crypto'), 'scryptSync')

  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  beforeEach(async () => {
    scryptSync.mockImplementation((pw) => Buffer.from(pw as string, 'utf-8'))
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

  it('defines the default values', async () => {
    const savedDiscussion = await new Discussion({
      messages: [{ message: 'yo', userId: new mongoose.Types.ObjectId() }],
      postName: 'table',
    }).save()

    savedDiscussion.messages = [
      ...savedDiscussion.messages,
      { message: 'hi', userId: new mongoose.Types.ObjectId() } as MessageModel,
    ]

    let { messages } = await savedDiscussion.save()

    expect(messages[0]).toHaveProperty('seen', false)
    expect(messages[1]).toHaveProperty('seen', false)

    expect(messages[0].createdAt.toISOString()).not.toBe(
      messages[1].createdAt.toISOString()
    )
  })

  it('generates a different channel name for each user', async () => {
    const savedDiscussion1 = await new Discussion({
      messages: [],
      postName: 'table',
    }).save()

    const savedDiscussion2 = await new Discussion({
      messages: [],
      postName: 'chair',
    }).save()

    expect(savedDiscussion1.channelName).not.toBe(savedDiscussion2.channelName)
  })

  it("adds the created discussion's id to the post, the buyer and the seller", async () => {
    const buyer = await new User({
      name: 'john',
      email: 'john@test.com',
      password: 'john password',
    }).save()

    const seller = await new User({
      name: 'jane',
      email: 'jane@test.com',
      password: 'jane password',
    }).save()

    const post = await new Post({
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

    const savedBuyer = (await User.findById(buyer._id)
      .lean()
      .exec()) as UserModel
    const savedSeller = (await User.findById(seller._id)
      .lean()
      .exec()) as UserModel
    const savedPost = (await Post.findById(post._id).lean().exec()) as PostModel

    expect(savedBuyer.discussionsIds.map((id) => id.toString())).toContain(
      discussion._id.toString()
    )
    expect(savedSeller.discussionsIds.map((id) => id.toString())).toContain(
      discussion._id.toString()
    )
    expect(savedPost.discussionsIds.map((id) => id.toString())).toContain(
      discussion._id.toString()
    )

    expect(savedSeller).toHaveProperty('hasUnseenMessages', true)
  })

  it("deletes the deleted discussion's id from the post, the buyer and the seller", async () => {
    const buyer = await new User({
      name: 'john',
      email: 'john@test.com',
      password: 'john password',
    }).save()

    const seller = await new User({
      name: 'jane',
      email: 'jane@test.com',
      password: 'jane password',
    }).save()

    const post = await new Post({
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

    const savedBuyer = (await User.findById(buyer._id)
      .lean()
      .exec()) as UserModel
    const savedSeller = (await User.findById(seller._id)
      .lean()
      .exec()) as UserModel
    const savedPost = (await Post.findById(post._id).lean().exec()) as PostModel

    expect(savedBuyer.discussionsIds).toHaveLength(0)
    expect(savedSeller.discussionsIds).toHaveLength(0)
    expect(savedPost.discussionsIds).toHaveLength(0)

    expect(savedSeller).toHaveProperty('hasUnseenMessages', false)
  })

  it('does not set false to hasUnseenMessages of the seller if it has other discussions with unseen messages', async () => {
    const seller = await new User({
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

    const savedSeller = (await User.findById(seller._id)
      .lean()
      .exec()) as UserModel

    const discussionsIds = savedSeller.discussionsIds.map((id) => id.toString())

    expect(discussionsIds).not.toContain(discussion._id.toString())
    expect(savedSeller).toHaveProperty('hasUnseenMessages', true)
  })

  it('does not set false to hasUnseenMessages of the buyer if it has other discussions with unseen messages', async () => {
    const buyer = await new User({
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

    const savedBuyer = (await User.findById(buyer._id)
      .lean()
      .exec()) as UserModel

    const discussionsIds = savedBuyer.discussionsIds.map((id) => id.toString())

    expect(discussionsIds).not.toContain(discussion._id.toString())
    expect(savedBuyer).toHaveProperty('hasUnseenMessages', true)
  })
})
