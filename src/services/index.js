import path from 'path'
import mongoManager from 'feathers-mongodb-management'

module.exports = function () {
  const app = this
  const servicesPath = path.join(__dirname, '..', 'services')
  const modelsPath = path.join(__dirname, '..', 'models')

  // Create services to manage MongoDB databases
  app.use('databases', mongoManager.database({ db: app.db._db }))

  app.createService('organisations', { modelsPath, servicesPath })
  app.createService('authorisation', { servicesPath })
  // Add hook to automatically creates a new organisation when creating a new user
  app.configureService('users', app.getService('users'), servicesPath)
}
