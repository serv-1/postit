import { connect, connection as conn, Types } from 'mongoose'
import User, { IUser } from '../../models/User'
import Account, { IAccount } from '../../models/Account'
import Post, { IPost } from '../../models/Post'
import { faker } from '@faker-js/faker'
import u1Json from '../fixtures/user1.json'
import postsJson from '../fixtures/posts.json'
import u2Json from '../fixtures/user2.json'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins
require('dotenv').config()
import env from '../../utils/constants/env'
import { randomBytes, scryptSync } from 'crypto'
import { readdir, unlink } from 'fs/promises'
import { cwd } from 'process'

export interface Ids {
  u1Id: string
  u2Id: string
  pId?: string
}

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async deleteImages() {
      const files = await readdir(cwd() + '/public/static/images/posts')

      for (const file of files) {
        await unlink(cwd() + '/public/static/images/posts/' + file)
      }

      return null
    },
    async 'db:reset'() {
      await connect(env.MONGODB_URI)
      const colls = await conn.db.collections()

      for (const coll of colls) {
        await coll.deleteMany({})
      }

      return null
    },
    async 'db:seed'({ posts }: { posts?: boolean } = {}): Promise<Ids> {
      await connect(env.MONGODB_URI)

      const ids = await insertUsers()
      await insertAccount(ids.u1Id)

      if (posts) ids.pId = await insertPosts(ids.u1Id)

      return ids
    },
    async 'db:getUser'(idOrEmail: string): Promise<IUser | null> {
      await connect(env.MONGODB_URI)

      if (idOrEmail.includes('@')) {
        return await User.findOne({ email: idOrEmail }).lean().exec()
      } else {
        return await User.findOne({ _id: idOrEmail }).lean().exec()
      }
    },
    async 'db:getAccountByUserId'(id: string): Promise<IAccount | null> {
      await connect(env.MONGODB_URI)
      return await Account.findOne({ userId: id }).lean().exec()
    },
    async 'db:getPostByUserId'(id: string): Promise<IPost | null> {
      await connect(env.MONGODB_URI)
      return await Post.findOne({ userId: id }).lean().exec()
    },
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

export default pluginConfig

/**
 * Insert a user registered with it's credentials and a user
 * registered with Google in database
 * @returns \{ uId: "credentials user id", guId: "google user id" \}
 */
async function insertUsers(): Promise<Ids> {
  const salt1 = randomBytes(16).toString('hex')
  const hash1 = scryptSync(u1Json.password, salt1, 64).toString('hex')

  const salt2 = randomBytes(16).toString('hex')
  const hash2 = scryptSync(u2Json.password, salt2, 64).toString('hex')

  const u1 = { ...u1Json, password: `${salt1}:${hash1}` }
  const u2 = { ...u2Json, password: `${salt2}:${hash2}` }

  const result = await User.insertMany([u1, u2])

  return { u1Id: result[0]._id.toString(), u2Id: result[1]._id.toString() }
}

/**
 * Insert an account with the given user id in database
 * @param id User's id
 */
async function insertAccount(id: string) {
  const account: IAccount = {
    type: 'oauth',
    provider: 'google',
    providerAccountId: String(faker.datatype.number()),
    refresh_token: faker.datatype.string(),
    scope: 'openid',
    id_token: faker.datatype.string(),
    userId: new Types.ObjectId(id),
    oauth_token_secret: faker.datatype.string(),
    oauth_token: faker.datatype.string(),
    session_state: faker.datatype.string(),
  }

  const doc = new Account(account)

  await doc.save()
}

/**
 * Insert 40 posts and return the id of the first added post (visible in posts.json fixture)
 * @param id user's id that will create the first post
 * @returns first added post's id
 */
async function insertPosts(id: string): Promise<string> {
  const posts: Omit<IPost, '_id'>[] = postsJson.map((post) => ({
    ...post,
    userId: new Types.ObjectId(post.userId),
  }))

  posts[0].userId = new Types.ObjectId(id)

  for (let i = 0; i < 40; i++) {
    const categories =
      i % 2 === 0 ? ['pet'] : i % 3 === 0 ? ['cat'] : ['pet', 'cat']

    posts.push({
      name: 'Cat',
      description: 'Horribly monstruous cat',
      categories,
      price: (i === 0 ? 1 : i) * 1000,
      images: ['/static/images/posts/cat-' + i + '.jpeg'],
      userId: new Types.ObjectId(generateRandomObjectId()),
    })
  }

  const result = await Post.insertMany(posts)

  return result[0]._id.toString()
}

function generateRandomObjectId() {
  let objectId: string = ''

  for (let i = 0; i < 24; i++) {
    objectId += Math.floor(Math.random() * 10)
  }

  return objectId
}
