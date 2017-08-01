import { updateAbilitiesForSubject } from '../permissions'

export function updateAbilities (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'updateAbilities' hook should only be used as a 'after' hook.`)
  }

  updateAbilitiesForSubject(hook.params.user)

  return hook
}
