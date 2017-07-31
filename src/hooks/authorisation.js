import { hooks } from 'kCore'

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
