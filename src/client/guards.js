import { hasServiceAbilities, hasResourceAbilities } from '../common/permissions'

// Guard unauthorised users
export function authorisationGuard (app) {
  return function authorisationGuard (user, to, from) {
    if (to.params.service) {
      // Check for access to service first
      let path = app.getServicePath(to.params.service, to.params.contextId, false)
      if (!hasServiceAbilities(user.abilities, path)) {
        return false
      }
      // Then check for access to operation
      if (to.params.operation && !hasResourceAbilities(user.abilities, to.params.operation, to.params.service, to.params.contextId)) {
        return false
      }
    }

    return true
  }
}
