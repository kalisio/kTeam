import LruCache from 'lru-cache'
import { Ability, AbilityBuilder } from 'casl'

// Define some alias to simplify ability definitions
Ability.addAlias('update', 'patch')
Ability.addAlias('read', ['get', 'find'])
Ability.addAlias('remove', 'delete')

const Roles = {
  member: 0,
  manager: 1,
  owner: 2
}

// Get the unique global symbol to store resource type on a resource object
export const RESOURCE_TYPE = 'type'
const ANONYMOUS_USER = 'anonymous'

// Store abilities of the N most active users in LRU cache (defaults to 1000)
const Cache = new LruCache(1000)

export function defineResourceRules (subject, resource, resourceService, can) {
  const role = Roles[resource.permissions]

  if (role >= Roles.member) {
    can('read', resourceService, { _id: resource._id.toString() })
  }
  if (role >= Roles.manager) {
    can('update', resourceService, { _id: resource._id.toString() })
    can('manage', 'authorisation', { resource: resource._id.toString() })
  }
  if (role >= Roles.owner) {
    can('remove', resourceService, { _id: resource._id.toString() })
  }
}

// Compute abilities for a given user
export function defineAbilitiesForSubject (subject) {
  const { rules, can } = AbilityBuilder.extract()

  // Default rules for unauthenticated users
  // Register
  can('create', 'users')

  // Default rules for all authenticated users
  if (subject) {
    // Read/Update profile
    can(['read', 'update', 'remove'], 'users', { _id: subject._id.toString() })
    // Create new organisations and associated DB
    can('create', 'organisations')
    can('create', 'databases')

    // Then rules for organisations
    if (subject.organisations) {
      subject.organisations.forEach(organisation => {
        defineResourceRules(subject, organisation, 'organisations', can)
        const role = Roles[organisation.permissions]
        if (role >= Roles.manager) {
          can('create', 'groups')
          can('update', 'users', { 'organisations._id': organisation._id.toString() })
        }
        if (role >= Roles.owner) {
          can('remove', 'databases', { name: organisation._id.toString() })
        }
        // Then rules for org groups
        if (organisation.groups) {
          organisation.groups.forEach(group => {
            defineResourceRules(subject, group, 'groups', can)
          })
        }
      })
    }
  }

  // CASL cannot infer the object type from the object itself so we need
  // to tell it how he can find the object type, i.e. service name
  return new Ability(rules, { subjectName: resource => {
    if (!resource || typeof resource === 'string') {
      return resource
    }
    return resource[Symbol.for(RESOURCE_TYPE)]
  }})
}

// Compute abilities for a given user and set it in cache the first time
// or get it from cache if found
export function getAbilitiesForSubject (subject) {
  if (subject) {
    if (Cache.has(subject._id.toString())) return Cache.get(subject._id.toString())
  } else {
    if (Cache.has(ANONYMOUS_USER)) return Cache.get(ANONYMOUS_USER)
  }

  let abilities = defineAbilitiesForSubject(subject)

  if (subject) {
    Cache.set(subject._id.toString(), abilities)
  } else {
    Cache.set(ANONYMOUS_USER, abilities)
  }

  return abilities
}

// Compute abilities for a given user and update it in cache
export function updateAbilitiesForSubject (subject) {
  if (subject) {
    Cache.del(subject._id.toString())
  } else {
    Cache.del(ANONYMOUS_USER)
  }

  return getAbilitiesForSubject(subject)
}
