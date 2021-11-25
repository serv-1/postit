import dbConnect from '../../utils/dbConnect'

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async 'db:reset'() {
      const conn = await dbConnect()
      conn.db.listCollections().next((err, collection) => {
        if (err) throw err
        if (collection) conn.db.collection(collection.name).deleteMany({})
      })
      return null
    },
  })
}

export default pluginConfig
