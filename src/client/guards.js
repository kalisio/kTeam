import { hasServiceAbilities, hasResourceAbilities } from '../permissions'

// Guard unauthorised users
export function authorisationGuard (app) {
  return function authorisationGuard (user, to, from) {
    // Check for access to service first
    if (to.params.service) {
      if (to.params.context) {
        if (!hasServiceAbilities(user.abilities, app.getServicePath(to.params.service, to.params.context))) {
          return false
        }
      } else if (!hasServiceAbilities(user.abilities, app.getServicePath(to.params.service))) {
        return false
      }
      // Then check for access to operation
      if (to.params.operation && !hasResourceAbilities(user.abilities, to.params.operation, to.params.service)) {
        return false
      }
    }

    return true
  }
}
