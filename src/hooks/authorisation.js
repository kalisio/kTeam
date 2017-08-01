import { merge } from 'feathers-commons'
import { Forbidden } from 'feathers-errors'
import { toMongoQuery } from 'casl'
import { hooks } from 'kCore'
import { RESOURCE_TYPE, getAbilitiesForSubject } from '../permissions'

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

export function processAbilities (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'processAbilities' hook should only be used as a 'before' hook.`)
  }

  const action = hook.method
  const service = hook.service.name
  // Build ability for user
  const abilities = getAbilitiesForSubject(hook.params.user)

  if (!hook.id) {
    // In this specific case there is no query to be run,
    // simply check against the object we'd like to create
    if (action === 'create') {
      hook.data[Symbol.for(RESOURCE_TYPE)] = service

      if (abilities.cannot(action, hook.data)) {
        hook.result = null
        throw new Forbidden(`You are not allowed to perform ${action} action on service ${service}`)
      }

      // Not required anymore
      delete hook.data[Symbol.for(RESOURCE_TYPE)]
    } else {
      // When we find/update/patch/remove multiple items this ensures thet
      // only the ones authorised by constraints on the resources will be fetched
      // This avoid fetching all first then check it one by one
      const rules = abilities.rulesFor(action, service)
      merge(hook.params.query, toMongoQuery(rules))
    }
  }

  hook.params.abilities = abilities

  return hook
}

export function authorise (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'authorise' hook should only be used as a 'after' hook.`)
  }

  if (hook.id && hook.params.abilities) {
    const action = hook.method
    const service = hook.service.name
    hook.result[Symbol.for(RESOURCE_TYPE)] = service
    if (hook.params.abilities.cannot(action, hook.result)) {
      hook.result = null
      throw new Forbidden(`You are not allowed to perform ${action} action on service ${service}`)
    }

    // Not required anymore
    delete hook.result[Symbol.for(RESOURCE_TYPE)]
  }

  return hook
}
