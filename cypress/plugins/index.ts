import { connect, connection as conn } from 'mongoose'
import User, { IUser } from '../../models/User'
import user from '../fixtures/user.json'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins
require('dotenv').config()
import { MONGODB_URI } from '../../utils/env'
import { randomBytes, scryptSync } from 'crypto'

export type dbSeedResult = {
  u1Id: string
  u2Id: string
}

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async 'db:reset'() {
      await connect(MONGODB_URI)
      const colls = await conn.db.collections()

      for (const coll of colls) {
        await coll.deleteMany({})
      }

      return null
    },
    async 'db:seed'(): Promise<dbSeedResult> {
      await connect(MONGODB_URI)

      const salt = randomBytes(16).toString('hex')
      const hash = scryptSync(user.password, salt, 64).toString('hex')

      const u = new User({ ...user, password: `${salt}:${hash}` })
      await u.save()

      const newUser = { name: 'Jane Doe', email: 'janedoe@test.com' }
      const u2 = new User({ ...user, ...newUser, password: `${salt}:${hash}` })
      await u2.save()

      return { u1Id: u.id, u2Id: u2.id }
    },
    async 'db:getUserById'(id: string): Promise<IUser | null> {
      await connect(MONGODB_URI)
      const user = await User.findOne({ _id: id }).exec()
      return user
    },
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

export default pluginConfig
