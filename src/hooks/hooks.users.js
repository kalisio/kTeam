
import _ from 'lodash'
import makeDebug from 'debug'
import { getItems } from 'feathers-hooks-common'
const debug = makeDebug('kalisio:kTeam:users:hooks')

export function joinOrganisation (hook) {
  let app = hook.app
  let subject = getItems(hook)
  let authorisationService = app.getService('authorisations')
  let usersService = app.getService('users')

    // Set membership for the created user
  return authorisationService.create({
    scope: 'organisations',
    permissions: subject.sponsor.roleGranted, // Member by default
    resource: subject.sponsor.organisationId,
    resourcesService: 'organisations'
  }, {
    subjectsService: usersService,
    subjects: [subject]
  })
  .then(authorisation => {
    debug('Organisation membership set for user ' + subject._id)
    return hook
  })
}

export function leaveOrganisations (options = { skipPrivate: true }) {
  return async function (hook) {
    if (hook.type !== 'after') {
      throw new Error(`The 'leaveOrganisations' hook should only be used as a 'after' hook.`)
    }

    let app = hook.app
    let organisationsService = app.getService('organisations')
    let authorisationService = app.getService('authorisations')
    let usersService = app.getService('users')
    let subject = getItems(hook)
    const organisations = _.get(subject, 'organisations', [])

    await Promise.all(organisations.map(organisation => {
      // Unset membership on org except private org if required
      if (options.skipPrivate && organisation._id.toString() === subject._id.toString()) return
      return authorisationService.remove(organisation._id.toString(), {
        query: {
          scope: 'organisations'
        },
        user: hook.params.user,
        // Because we already have resource set it as objects to avoid populating
        // Moreover used as an after hook the subject might not already exist anymore
        subjects: [subject],
        subjectsService: usersService,
        resource: organisation,
        resourcesService: organisationsService
      })
    }))

    debug('Membership unset for all organisations on user ' + subject._id)
    return hook
  }
}

