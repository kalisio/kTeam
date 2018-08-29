import path from 'path'

module.exports = async function () {
  const app = this
  const servicesPath = path.join(__dirname, '..', 'services')
  const modelsPath = path.join(__dirname, '..', 'models')

  // Create services to manage MongoDB databases, organisations, etc.
  app.createService('databases', { servicesPath, events: ['created', 'updated', 'removed', 'patched'] }) // Internal use only, no events
  app.createService('organisations', { modelsPath, servicesPath, perspectives: ['billing'] })

  await app.getService('organisations').configureOrganisations()
}
