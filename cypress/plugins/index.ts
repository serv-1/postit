import { connect, connection as conn } from 'mongoose'
import User from '../../models/User'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins
require('dotenv').config()
import { MONGODB_URI } from '../../utils/env'

type User = {
  name: string
  email: string
  password?: string
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
    async addUserToDb(user: User) {
      await connect(MONGODB_URI)
      const u = new User(user)
      await u.save()
      return null
    },
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

export default pluginConfig
