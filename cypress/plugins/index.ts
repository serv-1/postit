import dbConnect from '../../utils/dbConnect'

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
  })
}

export default pluginConfig
