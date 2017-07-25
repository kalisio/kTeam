import path from 'path'
import mongoManager from 'feathers-mongodb-management'
import { createPrivateOrganisation } from '../hooks'

module.exports = function () {
  const app = this

  // Create services to manage MongoDB databases
  app.use('databases', mongoManager.database({ db: app.db._db }))

  app.createService('organisations', path.join(__dirname, '..', 'models'), path.join(__dirname, '..', 'services'))
  // Add hook to automatically creates a new organisation when creating a new user
  let users = app.getService('users')
  if (users) {
    users.hooks({ after: { create: createPrivateOrganisation } })
  }
}
