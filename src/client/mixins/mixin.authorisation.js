import logger from 'loglevel'
import { Events } from 'quasar'
import { Store } from 'kCore/client'
import { defineAbilitiesForSubject, hasAbilities } from '../../permissions'

let authorisationMixin = {
  methods: {
    hasAbilities (action, resource, serviceName) {
      const abilities = Store.get('user.abilities', null)
      if (abilities) {
        return hasAbilities(abilities, action, resource, serviceName)
      }
      return false
    },
    updateAbilities () {
      const user = Store.get('user', null)
      let abilities = null
      if (user) {
        abilities = defineAbilitiesForSubject(user)
        Store.set('user.abilities', abilities)
      }
      return abilities
    }
  },
  mounted () {
    // Check if abilities are already computed
    let abilities = Store.get('user.abilities', null)
    if (!abilities) {
      // Otherwise try to compute them
      abilities = this.updateAbilities()
      logger.debug('New user abilities: ', abilities.rules)
    }
    // Whenever the user is updated, update abilities as well
    Events.$on('user-changed', user => {
      let abilities = this.updateAbilities()
      logger.debug('New user abilities: ', abilities.rules)
    })
  }
}

Store.set('mixins.authorisation', authorisationMixin)

export default authorisationMixin
