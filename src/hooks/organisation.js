import path from 'path'
import makeDebug from 'debug'
const debug = makeDebug('kaelia:kTeam')
const servicesPath = path.join(__dirname, '..', 'services')
const modelsPath = path.join(__dirname, '..', 'models')

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

    app.createService('users', {
      servicesPath,
      path: hook.result._id.toString() + '/users',
      proxy: {
        service: app.getService('users'),
        params: { query: { 'organisations._id': hook.result._id.toString() } }
      }
    })
    app.createService('groups', {
      modelsPath,
      servicesPath,
      path: hook.result._id.toString() + '/groups',
      db: organisationDb
    })
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

export function createOrganisationAuthorisations (hook) {
  let app = hook.app
  let authorisationService = app.getService('authorisation')
  let userService = app.getService('users')

  // Set membership for the owner
  return authorisationService.update(null, {
    scope: 'organisations',
    permissions: '*' // Owner by default
  }, { // Because we already have subject/resource set it as service params and not data
    subjects: [hook.params.owner],
    subjectsService: userService,
    resource: hook.result,
    resourcesService: hook.service
  })
  .then(authorisation => {
    debug('Private organisation ownership set for user ' + hook.result._id)
    return hook
  })
}

export function removeOrganisationAuthorisations (hook) {
  let app = hook.app
  let authorisationService = app.getService('authorisation')

  // Unset membership for the all org users
  return authorisationService.remove(null, {
    resource: hook.result,
    query: {
      subjectsService: hook.result._id.toString() + '/users',
      scope: 'organisations'
    }
  })
  .then(authorisation => {
    debug('Authorisations unset for organisation ' + hook.result._id)
    return hook
  })
}

export function createPrivateOrganisation (hook) {
  let app = hook.app
  let organisationService = app.getService('organisations')

  // Create a private organisation for the user
  return organisationService.create({
    _id: hook.result._id, // Same ID as user, fine because in another service
    name: hook.result.name // Same name as user
  }, {
    owner: hook.result
  })
  .then(org => {
    debug('Private organisation created for user ' + hook.result._id)
  })
}

export function removePrivateOrganisation (hook) {
  let app = hook.app
  let organisationService = app.getService('organisations')
  // Create a private organisation for the user
  return organisationService.remove(hook.result._id.toString())
  .then(org => {
    debug('Private organisation removed for user ' + hook.result._id)
  })
}
