import { connect, connection as conn } from 'mongoose'
import User, { IUser } from '../../models/User'
import Account, { IAccount } from '../../models/Account'
import userJson from '../fixtures/user.json'
import accountJson from '../fixtures/account.json'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins
require('dotenv').config()
import env from '../../utils/env'
import { randomBytes, scryptSync } from 'crypto'

export type dbSeedResult = {
  u1Id: string
  u2Id: string
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
    async 'db:seed'(): Promise<dbSeedResult> {
      await connect(env.MONGODB_URI)

      const u1 = await saveUser()
      const u2 = await saveUser({ name: 'Jane Doe', email: 'janedoe@test.com' })

      return { u1Id: u1._id, u2Id: u2._id }
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
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

export default pluginConfig

const saveUser = async (update?: Partial<typeof userJson>) => {
  let password: string | undefined
  const user = { ...userJson, ...update }

  if (user.password) {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(user.password, salt, 64).toString('hex')
    password = salt + ':' + hash
  }

  const image = { ...user.image, data: Buffer.from(user.image.data, 'base64') }
  const u = new User({ ...user, image, password })
  await u.save()

  const uAccount = new Account({ ...accountJson, userId: u._id })
  await uAccount.save()

  return u
}
