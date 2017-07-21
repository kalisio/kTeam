import path from 'path'
import mongoManager from 'feathers-mongodb-management'

module.exports = function () {
  const app = this

  // Create services to manage MongoDB
  app.use('databases', mongoManager.database({ db: app.db._db }))
  
  app.createService('organisations', path.join(__dirname, '..', 'models'), path.join(__dirname, '..', 'services'))
}
