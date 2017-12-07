import logger from 'loglevel'
import { Events } from 'quasar'
import { Store } from 'kCore/client'
import { defineAbilities, hasServiceAbilities, hasResourceAbilities } from '../../common/permissions'

let authorisationMixin = {
  methods: {
    hasAbilities (operation, resource, serviceName) {
      const abilities = Store.get('user.abilities', null)
      if (abilities) {
        // Check for access to service fisrt
        if (!hasServiceAbilities(abilities, serviceName)) {
          return false
        }
        // Then for access to resource
        return hasResourceAbilities(abilities, operation, serviceName, resource)
      }
      return false
    },
    updateAbilities () {
      const user = Store.get('user', null)
      let abilities = null
      if (user) {
        abilities = defineAbilities(user)
        Store.set('user.abilities', abilities)
      }
      if (abilities) {
        logger.debug('New user abilities: ', abilities.rules)
      }
      return abilities
    }
  },
  mounted () {
    // Check if abilities are already computed
    let abilities = Store.get('user.abilities', null)
    if (!abilities) {
      // Otherwise try to compute them
      this.updateAbilities()
    }
    // Whenever the user is updated, update abilities as well
    Events.$on('user-changed', user => this.updateAbilities())
  }
}

Store.set('mixins.authorisation', authorisationMixin)

export default authorisationMixin
