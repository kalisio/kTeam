import { Ability, AbilityBuilder } from 'casl'

// Define some alias to simplify ability definitions
Ability.addAlias('update', 'patch')
Ability.addAlias('read', ['get', 'find'])
Ability.addAlias('remove', 'delete')

export const Roles = {
  member: 0,
  manager: 1,
  owner: 2
}

// Hooks that can be added to customize abilities computation
let hooks = []

// Get the unique global symbol to store resource type on a resource object
export const RESOURCE_TYPE = 'type'

export function defineResourceRules (subject, resource, resourceService, can) {
  const role = Roles[resource.permissions]

  if (role >= Roles.member) {
    can('read', resourceService, { _id: resource._id.toString() })
  }
  if (role >= Roles.manager) {
    can('update', resourceService, { _id: resource._id.toString() })
    can('manage', 'authorisations', { resource: resource._id.toString() })
  }
  if (role >= Roles.owner) {
    can('remove', resourceService, { _id: resource._id.toString() })
  }
}

// Hook computing anonymous abilities for a given user
export function defineAnonymousAbilitiesForSubject (subject, can, cannot) {
  // Register
  can('create', 'users')
}

// Hook computing default abilities for a given user
export function defineUserAbilitiesForSubject (subject, can, cannot) {
  if (subject) {
    // Read/Update profile
    can(['update', 'remove'], 'users', { _id: subject._id.toString() })
    // Create new organisations and associated DB
    can('create', 'organisations')
  }
}

// Hook computing organisation abilities for a given user
export function defineOrganisationAbilitiesForSubject (subject, can, cannot) {
  if (subject && subject.organisations) {
    subject.organisations.forEach(organisation => {
      // Generic rules for resources
      defineResourceRules(subject, organisation, 'organisations', can)
      // Specific rules for organiations
      const role = Roles[organisation.permissions]
      if (role >= Roles.manager) {
        can('create', 'groups', { organisation: organisation._id.toString() })
      }
    })
  }
}

// Hook computing group abilities for a given user
export function defineGroupAbilitiesForSubject (subject, can, cannot) {
  if (subject && subject.groups) {
    subject.groups.forEach(group => {
      // Generic rules for resources
      defineResourceRules(subject, group, 'groups', can)
      // Np specific rules for groups
    })
  }
}

// Compute abilities for a given user
export function defineAbilitiesForSubject (subject) {
  const { rules, can, cannot } = AbilityBuilder.extract()

  // Run registered hooks
  hooks.forEach(hook => hook(subject, can, cannot))

  // CASL cannot infer the object type from the object itself so we need
  // to tell it how he can find the object type, i.e. service name
  return new Ability(rules, { subjectName: resource => {
    if (!resource || typeof resource === 'string') {
      return resource
    }
    return resource[Symbol.for(RESOURCE_TYPE)]
  }})
}

defineAbilitiesForSubject.registerHook = function (hook) {
  if (!hooks.includes(hook)) {
    hooks.push(hook)
  }
}

defineAbilitiesForSubject.unregisterHook = function (hook) {
  hooks = hooks.filter(registeredHook => registeredHook !== hook)
}

export function hasAbilities (abilities, action, resource, serviceName) {
  resource[Symbol.for(RESOURCE_TYPE)] = serviceName
  const result = abilities.can(action, resource)
  // Not required anymore
  delete resource[Symbol.for(RESOURCE_TYPE)]
  return result
}

// Register all default hooks
// Default rules for unauthenticated users
defineAbilitiesForSubject.registerHook(defineAnonymousAbilitiesForSubject)
// Default rules for all authenticated users
defineAbilitiesForSubject.registerHook(defineUserAbilitiesForSubject)
// Then rules for organisations
defineAbilitiesForSubject.registerHook(defineOrganisationAbilitiesForSubject)
// Then rules for groups
defineAbilitiesForSubject.registerHook(defineGroupAbilitiesForSubject)
