import User from '../../models/User'
import dbConnect from '../../utils/dbConnect'
const { GoogleSocialLogin } = require('cypress-social-logins').plugins

type User = {
  name: string
  email: string
  password?: string
}

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async 'db:reset'() {
      const conn = await dbConnect()
      const colls = await conn.db.collections()

      for (const coll of colls) {
        await coll.deleteMany({})
      }

      return null
    },
    async addUserToDb(user: User) {
      await dbConnect()
      const u = new User(user)
      await u.save()
      return null
    },
    GoogleSocialLogin: GoogleSocialLogin,
  })
}

export default pluginConfig
