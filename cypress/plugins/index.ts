import { connect, connection as conn, Types } from 'mongoose'
import User, { defaultImage, IUser } from '../../models/User'
import Account, { IAccount } from '../../models/Account'
import Post, { IPost } from '../../models/Post'
import { faker } from '@faker-js/faker'
import user from '../fixtures/user.json'
import postsJson from '../fixtures/posts.json'
import googleUser from '../fixtures/google-user.json'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins
require('dotenv').config()
import env from '../../utils/constants/env'
import { randomBytes, scryptSync } from 'crypto'

export interface UsersIds {
  uId: string
  guId: string
}

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async 'db:reset'() {
      await connect(env.MONGODB_URI)
      const colls = await conn.db.collections()

      for (const coll of colls) {
        await coll.deleteMany({})
      }

      return null
    },
    async 'db:seed'({ posts }: { posts?: boolean } = {}): Promise<UsersIds> {
      await connect(env.MONGODB_URI)

      const usersIds = await insertUsers()
      await insertAccount(usersIds.guId)

      if (posts) await insertPosts()

      return usersIds
    },
    async 'db:getUserById'(id: string): Promise<IUser | null> {
      await connect(env.MONGODB_URI)
      const user = await User.findOne({ _id: id }).exec()
      return user
    },
    async 'db:getAccountByUserId'(id: string): Promise<IAccount | null> {
      await connect(env.MONGODB_URI)
      const account = await Account.findOne({ userId: id }).exec()
      return account
    },
    async 'db:getPostByUserId'(id: string): Promise<IPost | null> {
      await connect(env.MONGODB_URI)
      const post = await Post.findOne({ userId: id }).exec()
      return post
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
async function insertUsers(): Promise<UsersIds> {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(user.password, salt, 64).toString('hex')

  const u = { ...user, password: `${salt}:${hash}`, image: defaultImage }
  const gu = { ...googleUser, image: defaultImage }

  const result = await User.insertMany([u, gu])

  return { uId: result[0]._id.toString(), guId: result[1]._id.toString() }
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

async function insertPosts() {
  const posts: Omit<IPost, '_id'>[] = postsJson.map((post) => ({
    ...post,
    images: post.images.map((image) => ({
      ...image,
      data: Buffer.from(image.data, 'base64'),
    })),
    userId: new Types.ObjectId(post.userId),
  }))

  for (let i = 0; i < 40; i++) {
    const categories =
      i % 2 === 0 ? ['pet'] : i % 3 === 0 ? ['cat'] : ['pet', 'cat']

    posts.push({
      name: 'Cat',
      description: 'Horribly monstruous cat',
      categories,
      price: (i === 0 ? 1 : i) * 1000,
      images: [
        {
          data: Buffer.from('base64', 'base64'),
          contentType: 'image/jpeg',
        },
      ],
      userId: new Types.ObjectId(generateRandomObjectId()),
    })
  }

  await Post.insertMany(posts)
}

function generateRandomObjectId() {
  let objectId: string = ''

  for (let i = 0; i < 24; i++) {
    objectId += Math.floor(Math.random() * 10)
  }

  return objectId
}
