import { hasServiceAbilities, hasResourceAbilities } from '../permissions'

// Guard unauthorised users
export function authorisationGuard (app) {
  return function authorisationGuard (user, to, from, next) {
    // Check for access to service first
    if (!hasServiceAbilities(user.abilities, app.getServicePath(to.params.service, to.params.context))) {
      return false
    }
    // Then check for access to operation
    if (!hasResourceAbilities(user.abilities, to.params.action, to.params.service)) {
      return false
    }
    return true
  }
}
