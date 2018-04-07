import _ from 'lodash'
import makeDebug from 'debug'
import { Forbidden } from 'feathers-errors'
import { permissions } from 'kCore/common'

const debug = makeDebug('kalisio:kTeam:authorisations:hooks')

export function preventRemovingLastOwner (resourceScope) {
  return async function (hook) {
    let app = hook.app
    const params = hook.params
    const query = params.query || {}
    const scope = query.scope
    const resource = hook.params.resource
    const subjects = hook.params.subjects
    let userService = app.getService('users')
    if ((scope === resourceScope) && resource && resource._id) {
      // Count existing owners
      const owners = await permissions.countSubjectsForResource(userService, resourceScope, resource._id, permissions.Roles.owner)
      // Now count owners we remove permissions on
      const removedOwners = subjects.reduce((count, subject) => {
        const resources = _.get(subject, resourceScope, [])
        const ownedResource = _.find(resources, { _id: resource._id, permissions: permissions.RoleNames[permissions.Roles.owner] })
        return (ownedResource ? count + 1 : count)
      }, 0)
      // If none remains stop
      if (removedOwners >= owners.total) {
        debug('Cannot remove the last owner of resource ', resource)
        let resourceName = resource.name ? resource.name : resource._id.toString()
        throw new Forbidden('You are not allowed to remove the last owner of resource ' + resourceName, {
          translation: {
            key: 'CANNOT_REMOVE_LAST_OWNER',
            params: { resource: resourceName }
          }
        })
      }
    }
    return hook
  }
}

export function removeOrganisationGroupsAuthorisations (hook) {
  let app = hook.app
  let authorisationService = app.getService('authorisations')
  let org = hook.params.resource
  let user = hook.params.user
  // Unset membership for the all org groups
  let orgGroupService = app.getService('groups', org)
  return orgGroupService.find({ paginate: false })
  .then(groups => {
    return Promise.all(groups.map(group => {
      // Unset membership on group for the all org users
      return authorisationService.remove(group._id.toString(), {
        query: {
          scope: 'groups'
        },
        user,
        // Because we already have resource set it as objects to avoid populating
        // Moreover used as an after hook the resource might not already exist anymore
        subjects: hook.params.subjects,
        subjectsService: hook.params.subjectsService,
        resource: group,
        resourcesService: orgGroupService
      })
    }))
  })
  .then(groups => {
    debug('Authorisations unset on groups for organisation ' + org._id)
    return hook
  })
}

export async function removeOrganisationTagsAuthorisations (hook) {
  let app = hook.app
  let org = hook.params.resource
  let user = hook.params.subjects[0]
  if (user.tags) {
    // Retrieve org tags
    const orgTagsService = app.getService('tags', org)
    let tags = await orgTagsService.find({ paginate: false })
    // Unset membership for the all org tags if needed
    let filteredTags = _.find(user.tags, (tag) => {
      return _.findIndex(tags, { _id: tag._id }) === -1
    })
    const usersService = app.getService('users')
    await usersService.patch(user._id, { tags: filteredTags })
  }

  debug('Authorisations unset on tags for organisation ' + org._id)
  return hook
}
