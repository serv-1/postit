import { MongoMemoryServer } from 'node_modules/mongodb-memory-server'
import getDiscussion from '.'
import mongoose from 'mongoose'
import Discussion, { type DiscussionDoc } from 'models/Discussion'
import Post, { type PostDoc } from 'models/Post'

vi.mock('libs/pusher/server', () => ({
  default: {},
}))

let mongoServer: MongoMemoryServer
let discussion: mongoose.HydratedDocument<DiscussionDoc>
let post: mongoose.HydratedDocument<PostDoc>

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  const buyerId = new mongoose.Types.ObjectId()
  const sellerId = new mongoose.Types.ObjectId()

  post = await new Post({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    images: [''],
    address: 'Paris, France',
    latLon: [0, 1],
    price: 40 * 100,
    userId: sellerId,
  }).save()

  discussion = await new Discussion({
    buyerId,
    sellerId,
    postId: post._id,
    messages: [{ message: 'yo', userId: buyerId }],
  }).save()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

it('replaces postId with post { id, name }', async () => {
  const result = await getDiscussion(discussion._id)

  expect(result).not.toHaveProperty('postId')
  expect(result).not.toHaveProperty('posts')
  expect(result).toHaveProperty('post', { id: post._id, name: post.name })
})

it('accepts the id as a string', async () => {
  const result = await getDiscussion(discussion._id.toString())

  expect(result._id).toEqual(discussion._id)
})

it('returns undefined when the discussion does not exist', async () => {
  const result = await getDiscussion(new mongoose.Types.ObjectId())

  expect(result).toBeUndefined()
})
