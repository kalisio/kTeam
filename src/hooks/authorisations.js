import { merge } from 'feathers-commons'
import { Forbidden } from 'feathers-errors'
import _ from 'lodash'
import { ObjectID } from 'mongodb'
import { toMongoQuery } from 'casl'
import { hooks } from 'kCore'
import { hasServiceAbilities, hasResourceAbilities } from '../permissions'
import makeDebug from 'debug'

const debug = makeDebug('kalisio:kTeam:authorisation')

// Utility function used to convert from string to MongoDB IDs as required by queries
function objectifyIDs (query) {
  _.forOwn(query, (value, key) => {
    // Process current attributes or  recurse
    if (typeof value === 'object') {
      objectifyIDs(value)
    } else if (key === '_id') {
      query[key] = new ObjectID(value)
    }
  })
}

export function populateSubjects (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'populateSubjects' hook should only be used as a 'before' hook.`)
  }

  return hooks.populateObjects({ serviceField: 'subjectsService', idField: 'subjects', throwOnNotFound: true })(hook)
}

export function populateResource (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'populateResource' hook should only be used as a 'before' hook.`)
  }

  return hooks.populateObject({ serviceField: 'resourcesService', idField: 'resource', throwOnNotFound: true })(hook)
}

export function authorise (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'authorise' hook should only be used as a 'before' hook.`)
  }

  // If called internally we skip authorisation
  let checkAuthorisation = (hook.params.provider === 'external')
  // If already checked we skip authorisation
  if (hook.params.authorised) checkAuthorisation = false
  // We also skip authorisation for built-in Feathers services like authentication
  if (typeof hook.service.getPath !== 'function') checkAuthorisation = false
  // If explicitely asked to perform/skip, override defaults
  if (hook.params.hasOwnProperty('checkAuthorisation')) {
    checkAuthorisation = hook.params.checkAuthorisation
    // Bypass authorisation for next hooks otherwise we will loop infinitely
    delete hook.params.checkAuthorisation
  }

  if (checkAuthorisation) {
    const action = hook.method
    const resourceType = hook.service.name
    // Build ability for user
    let authorisationService = hook.app.getService('authorisations')
    const abilities = authorisationService.getAbilitiesForSubject(hook.params.user)
    hook.params.abilities = abilities

    debug('Provider is ', hook.params.provider)
    debug('Action is ', action)
    debug('Resource is ', resourceType)
    debug('User is ', hook.params.user)
    debug('User abilities are ', abilities.rules)

    // Check for access to service fisrt
    if (!hasServiceAbilities(abilities, hook.service)) {
      throw new Forbidden(`You are not allowed to access service ${hook.service.getPath()}`)
    }

    if (!hook.id) {
      // In this specific case there is no query to be run,
      // simply check against the object we'd like to create
      if (action === 'create') {
        debug('Target resource is ', hook.data)
        if (!hasResourceAbilities(abilities, action, resourceType, hook.data)) {
          throw new Forbidden(`You are not allowed to perform ${action} action on ${resourceType}`)
        }
      } else {
        // When we find/update/patch/remove multiple items this ensures thet
        // only the ones authorised by constraints on the resources will be fetched
        // This avoid fetching all first then check it one by one
        const rules = abilities.rulesFor(action, resourceType)
        const dbQuery = toMongoQuery(rules)
        debug('Target resource conditions query is ', dbQuery)
        merge(hook.params.query, objectifyIDs(dbQuery))
      }
    // Some specific services might not expose a get function, in this case we can check for authorisation
    // this has to be implemented by the service itself
    } else if (typeof hook.service.get === 'function') {
      // In this case (single get/update/patch) we need to fetch the item first
      return hook.service.get(hook.id, hook.params)
      .then(resource => {
        debug('Target resource is ', resource)
        // Then check against the object we'd like to manage
        if (!hasResourceAbilities(abilities, action, resourceType, resource)) {
          throw new Forbidden(`You are not allowed to perform ${action} action on ${resourceType}`)
        }
        // Avoid fetching again the object in this case
        if (action === 'get') {
          hook.result = resource
        }
        hook.params.authorised = true
        return hook
      })
    }
  } else {
    debug('Authorisation skipped')
  }

  hook.params.authorised = true
  return Promise.resolve(hook)
}
