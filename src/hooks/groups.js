import makeDebug from 'debug'
const debug = makeDebug('kaelia:kTeam')

export function createGroupAuthorisations (hook) {
  let app = hook.app
  let authorisationService = app.getService('authorisations')
  let userService = app.getService('users')

  // Set membership for the owner
  return authorisationService.create({
    scope: 'groups',
    permissions: 'owner'
  }, {
    authorised: true, // Internal call so skip uthorisations
    user: hook.params.user,
    // Because we already have subject/resource set it as objects to avoid populating
    subjects: [hook.params.user],
    subjectsService: userService,
    resource: hook.result,
    resourcesService: hook.service
  })
  .then(authorisation => {
    debug('Group ownership set for user ' + hook.result._id)
    return hook
  })
}

export function removeGroupAuthorisations (hook) {
  let app = hook.app
  let authorisationService = app.getService('authorisations')

  // Unset membership for the all org users
  return authorisationService.remove(hook.result._id.toString(), {
    query: {
      subjectsService: hook.result.organisation.toString() + '/users',
      scope: 'groups'
    },
    user: hook.params.user
  })
  .then(authorisation => {
    debug('Authorisations unset for group ' + hook.result._id)
    return hook
  })
}
