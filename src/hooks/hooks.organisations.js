import _ from 'lodash'
import makeDebug from 'debug'
import { Forbidden } from 'feathers-errors'
const debug = makeDebug('kalisio:kTeam:organisations:hooks')

export function createOrganisationServices (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'createOrganisationServices' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let organisationService = hook.service
  let databaseService = app.getService('databases')

  // First we create the organisation DB
  return databaseService.create({
    name: hook.result._id.toString()
  }, {
    user: hook.params.user
  })
  .then(db => {
    debug('DB created for organisation ' + hook.result.name)
    // Jump from infos/stats to real DB object
    db = app.db.instance.db(hook.result._id.toString())
    organisationService.createOrganisationServices(hook.result, db)
    return hook
  })
}

export function removeOrganisationServices (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'removeOrganisationServices' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let organisationService = hook.service
  let databaseService = app.getService('databases')

  // Then we remove the organisation DB
  return databaseService.remove(hook.result._id.toString(), {
    user: hook.params.user
  })
  .then(db => {
    debug('DB removed for organisation ' + hook.result.name)
    organisationService.removeOrganisationServices(hook.result)
    return hook
  })
}

export function createOrganisationAuthorisations (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'createOrganisationAuthorisations' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let authorisationService = app.getService('authorisations')
  let userService = app.getService('users')
  // Set membership for the owner
  return authorisationService.create({
    scope: 'organisations',
    permissions: 'owner' // Owner by default
  }, {
    user: hook.params.user,
    // Because we already have subject/resource set it as objects to avoid populating
    subjects: [hook.params.user],
    subjectsService: userService,
    resource: hook.result,
    resourcesService: hook.service
  })
  .then(authorisation => {
    debug('Organisation ownership set for user ' + hook.result._id)
    return hook
  })
}

export function removeOrganisationAuthorisations (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'removeOrganisationAuthorisations' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let authorisationService = app.getService('authorisations')

  // Unset membership for the all org users
  return authorisationService.remove(hook.result._id.toString(), {
    query: {
      subjectsService: hook.result._id.toString() + '/members',
      scope: 'organisations'
    },
    user: hook.params.user,
    // Because we already have resource set it as objects to avoid populating
    // Moreover used as an after hook the resource might not already exist anymore
    resource: hook.result,
    resourcesService: hook.service
  })
  .then(authorisation => {
    debug('Authorisations unset for organisation ' + hook.result._id)
    return hook
  })
}

export function removeOrganisationGroups (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'removeOrganisationGroups' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let orgGroupService = app.getService('groups', hook.result)
  return orgGroupService.find({ paginate: false })
  .then(groups => {
    return Promise.all(groups.map(group => {
      return orgGroupService.remove(group._id.toString(), {
        user: hook.params.user
      })
    }))
  })
  .then(groups => {
    debug('Removed groups for organisation ' + hook.result._id)
    return hook
  })
}

export async function removeOrganisationTags (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'removeOrganisationTags' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  // Retrieve the list of tags
  const orgTagsService = app.getService('tags', hook.result)
  let tags = await orgTagsService.find({ paginate: false })
  // Retrieve the list of members
  const orgMembersService = app.getService('members', hook.result)
  let members = await orgMembersService.find({ paginate: false })
  // Update each members
  for (let i in members) {
    let member = members[i]
    if (member.tags) {
      let filteredTagsMember = _.find(member.tags, (tag) => {
        return _.findIndex(tags, { _id: tag._id }) === -1
      })
      await orgMembersService.patch(member._id, { tags: filteredTagsMember })
    }
  }

  debug('Removed tags from organisation ' + hook.result._id)
  return hook
}

export function createPrivateOrganisation (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'createPrivateOrganisation' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let organisationService = app.getService('organisations')
  // Create a private organisation for the user
  return organisationService.create({
    _id: hook.result._id, // Same ID as user, fine because in another service
    name: hook.result.profile.name // Same name as user
  }, {
    user: hook.result
  })
  .then(org => {
    debug('Private organisation created for user ' + hook.result._id)
  })
}

export function removePrivateOrganisation (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'removePrivateOrganisation' hook should only be used as a 'after' hook.`)
  }

  let app = hook.app
  let organisationService = app.getService('organisations')
  // Remove the private user's organisation
  return organisationService.remove(hook.result._id.toString(), {
    user: hook.result
  })
  .then(org => {
    debug('Private organisation removed for user ' + hook.result._id)
  })
}

export function preventRemoveOrganisation (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'preventRemoveOrganisations' hook should only be used as a 'before' hook.`)
  }

  let user = hook.params.user
  if (user.groups && user.groups.length > 0) {
    // We must ensure the user is no more an o
    throw new Forbidden('You are not allowed to delete the organisation', {
      translation: { key: 'CANNOT_REMOVE_ORGANISATION' }
    })
  }
  return hook
}
