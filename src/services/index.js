import path from 'path'

module.exports = function () {
  const app = this
  const servicesPath = path.join(__dirname, '..', 'services')
  const modelsPath = path.join(__dirname, '..', 'models')

  // Create services to manage MongoDB databases, organisations, etc.
  app.createService('databases', { servicesPath, events: ['created', 'updated', 'removed', 'patched'] }) // Internal use only, no events
  const orgsService = app.createService('organisations', { modelsPath, servicesPath, perspectives: ['billing'] })

  // Replication management
  const usersService = app.getService('users')
  const authorisationsService = app.getService('authorisations')
  // Ensure permissions are correctly distributed when replicated
  usersService.on('patched', user => {
    // Patching profile should not trigger abilities update since
    // it is a perspective and permissions are not available in this case
    if (user.organisations || user.groups) authorisationsService.updateAbilities(user)
  })
  // Ensure org services are correctly distributed when replicated
  orgsService.on('created', organisation => {
    // Check if already done (initiator)
    const orgMembersService = app.getService('members', organisation)
    if (!orgMembersService) {
      // Jump from infos/stats to real DB object
      const db = app.db.instance.db(organisation._id.toString())
      orgsService.createOrganisationServices(organisation, db)
    }
  })
  orgsService.on('removed', organisation => {
    // Check if already done (initiator)
    const orgMembersService = app.getService('members', organisation)
    if (orgMembersService) return
    orgsService.removeOrganisationServices(organisation)
  })
}
