import path from 'path'
import makeDebug from 'debug'
const debug = makeDebug('kaelia:kTeam')

export function createOrganisationServices (hook) {
  let app = hook.app
  let databaseService = app.service('databases')

  // First we create the organisation DB
  return databaseService.create({
    name: hook.result._id.toString()
  })
  .then(db => {
    debug('DB created for organisation ' + hook.result.name)
    let organisationDb = app.db.instance.db(hook.result._id.toString())

    app.createContextualService(hook.result,
      'groups',
      path.join(__dirname, '..', 'models'),
      path.join(__dirname, '..', 'services'),
      { db: organisationDb })
    return hook
  })
}

export function removeOrganisationServices (hook) {
  let app = hook.app
  let databaseService = app.service('databases')

  // Then we remove the organisation DB
  return databaseService.remove(hook.result._id.toString())
  .then(db => {
    debug('DB removed for organisation ' + hook.result.name)
    return hook
  })
}

export function createPrivateOrganisation (hook) {
  let app = hook.app
  let organisationService = app.getService('organisations')
  // Create a private organisation for the user
  return organisationService.create({
    _id: hook.result._id,
    name: hook.result.name
  })
  .then(org => {
    debug('Private organisation created for user ' + hook.result.name)
    return hook
  })
}

export function removePrivateOrganisation (hook) {
  let app = hook.app
  let organisationService = app.getService('organisations')
  // Create a private organisation for the user
  return organisationService.remove(hook.result._id.toString())
  .then(org => {
    debug('Private organisation removed for user ' + hook.result.name)
    return hook
  })
}
