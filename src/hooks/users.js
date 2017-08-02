export function updateAbilities (hook) {
  if (hook.type !== 'after') {
    throw new Error(`The 'updateAbilities' hook should only be used as a 'after' hook.`)
  }

  let authorisationService = hook.app.getService('authorisations')
  authorisationService.updateAbilitiesForSubject(hook.params.user)

  return hook
}
