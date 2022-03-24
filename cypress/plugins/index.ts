import { connect, connection as conn } from 'mongoose'
import User, { UserModel } from '../../models/User'
import Account, { AccountModel } from '../../models/Account'
import Post, { PostModel } from '../../models/Post'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins
require('dotenv').config()
import env from '../../utils/constants/env'
import { readdir, unlink } from 'fs/promises'
import { cwd } from 'process'
import createFile from '../../utils/functions/createFile'

type UserToAdd = Omit<UserModel, '_id' | 'postsIds' | 'image'> & {
  postsIds?: string
  image?: string
}
type PostToAdd = Omit<PostModel, '_id'>
type AccountToAdd = Omit<AccountModel, '_id'>

interface CreateFileParams {
  data: string | Buffer
  ext: string
  dir: string
  name?: string
}

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async deleteImages(dir: string) {
      const files = await readdir(cwd() + '/public/static/images/' + dir)

      for (const file of files) {
        await unlink(cwd() + `/public/static/images/${dir}/` + file)
      }

      return null
    },
    async createFile({ data, ext, dir, name }: CreateFileParams) {
      await createFile(data, ext, dir, { name })
      return null
    },
    async reset() {
      await connect(env.MONGODB_URI)

      for (const coll of await conn.db.collections()) {
        await coll.deleteMany({})
      }

      return null
    },
    async addUser(user: UserToAdd): Promise<string> {
      const addedUser = await new User(user).save()
      return addedUser._id.toString()
    },
    async addUsers(users: string): Promise<string[]> {
      const addedUsers = await User.insertMany(JSON.parse(users))
      return addedUsers.map((user) => user._id.toString())
    },
    async addPost(post: PostToAdd): Promise<string> {
      const addedPost = await new Post(post).save()
      return addedPost._id.toString()
    },
    async addPosts(posts: string): Promise<string[]> {
      const addedPosts = await Post.insertMany(JSON.parse(posts))
      return addedPosts.map((post) => post._id.toString())
    },
    async addAccount(account: AccountToAdd): Promise<string> {
      const addedAccount = await new Account(account).save()
      return addedAccount._id.toString()
    },
    async addAccounts(accounts: string): Promise<string[]> {
      const addedAccounts = await Account.insertMany(JSON.parse(accounts))
      return addedAccounts.map((account) => account._id.toString())
    },
    async getUser(idOrEmail: string): Promise<UserModel | null> {
      await connect(env.MONGODB_URI)

      if (idOrEmail.includes('@')) {
        return await User.findOne({ email: idOrEmail }).lean().exec()
      } else {
        return await User.findOne({ _id: idOrEmail }).lean().exec()
      }
    },
    async getAccountByUserId(id: string): Promise<AccountModel | null> {
      await connect(env.MONGODB_URI)
      return await Account.findOne({ userId: id }).lean().exec()
    },
    async getPostByUserId(id: string): Promise<PostModel | null> {
      await connect(env.MONGODB_URI)
      return await Post.findOne({ userId: id }).lean().exec()
    },
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

export default pluginConfig
