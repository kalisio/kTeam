import makeDebug from 'debug'
const debug = makeDebug('kalisio:kTeam:users:hooks')

export function updateAbilities (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'updateAbilities' hook should only be used as a 'after' hook.`)
  }

  let authorisationService = hook.app.getService('authorisations')
  authorisationService.updateAbilities(hook.params.user)

  return hook
}

export function joinOrganisation (hook) {
  let app = hook.app
  let authorisationService = app.getService('authorisations')
  let usersService = app.getService('users')

    // Set membership for the created user
  return authorisationService.create({
    scope: 'organisations',
    permissions: hook.result.sponsor.roleGranted, // Member by default
    resource: hook.result.sponsor.organisationId,
    resourcesService: 'organisations'
  }, {
    subjectsService: usersService,
    subjects: [hook.result]
  })
  .then(authorisation => {
    debug('Organisation membership set for user ' + hook.result._id)
    return hook
  })
}
