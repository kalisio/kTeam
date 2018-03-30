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
        throw new Forbidden('You are not allowed to remove the last owner of resource ' + (resource.name ? resource.name : resource._id.toString()))
      }
    }
    return hook
  }
}
