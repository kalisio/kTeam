import { merge } from 'feathers-commons'
import { Forbidden } from 'feathers-errors'
import { toMongoQuery } from 'casl'
import { hooks } from 'kCore'
import { hasAbilities } from '../permissions'
import makeDebug from 'debug'

const debug = makeDebug('kaelia:kTeam:authorisation')

export function populateSubjects (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'populateSubjects' hook should only be used as a 'before' hook.`)
  }

  return hooks.populateObjects('subjectsService', 'subjects')(hook)
}

export function populateResource (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'populateResource' hook should only be used as a 'before' hook.`)
  }

  return hooks.populateObject('resourcesService', 'resource')(hook)
}

export function authorise (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'authorise' hook should only be used as a 'before' hook.`)
  }

  // If called internally we skip authorisation unless explicitely asked for
  if (!hook.params.checkAuthorisation && (!hook.params.provider || hook.params.authorised)) {
    return Promise.resolve(hook)
  }

  const action = hook.method
  const serviceName = hook.service.name
  // Build ability for user
  let authorisationService = hook.app.getService('authorisations')
  const abilities = authorisationService.getAbilitiesForSubject(hook.params.user)
  hook.params.abilities = abilities

  debug('User is ', hook.params.user)
  debug('User abilities are ', abilities.rules)

  if (!hook.id) {
    // In this specific case there is no query to be run,
    // simply check against the object we'd like to create
    if (action === 'create') {
      debug('Target resource is ', hook.data)
      if (!hasAbilities(abilities, action, hook.data, serviceName)) {
        throw new Forbidden(`You are not allowed to perform ${action} action on service ${serviceName}`)
      }
    } else {
      // When we find/update/patch/remove multiple items this ensures thet
      // only the ones authorised by constraints on the resources will be fetched
      // This avoid fetching all first then check it one by one
      const rules = abilities.rulesFor(action, serviceName)
      debug('Target resource rules are ', rules)
      merge(hook.params.query, toMongoQuery(rules))
    }
  // Some specific services might not expose a get function, in this case we can check for authorisation
  // this has to be implemented by the service itself
  } else if (typeof hook.service.get === 'function') {
    // In this case (single get/update/patch) we need to fetch the item first
    // Bypass authorisation otherwise we will loop infinitely
    hook.params.checkAuthorisation = false
    return hook.service.get(hook.id, hook.params)
    .then(resource => {
      debug('Target resource is ', resource)
      // Then check against the object we'd like to manage
      if (!hasAbilities(abilities, action, resource, serviceName)) {
        throw new Forbidden(`You are not allowed to perform ${action} action on service ${serviceName}`)
      }
      // Avoid fetching again the object in this case
      if (action === 'get') {
        hook.result = resource
      }
      hook.params.authorised = true
      return hook
    })
  }

  hook.params.authorised = true
  return Promise.resolve(hook)
}
