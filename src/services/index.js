import path from 'path'

module.exports = async function () {
  const app = this
  const servicesPath = path.join(__dirname, '..', 'services')
  const modelsPath = path.join(__dirname, '..', 'models')

  // Create services to manage MongoDB databases, organisations, authorisations, etc.
  app.createService('databases', { servicesPath })
  app.createService('organisations', { modelsPath, servicesPath })
  app.createService('authorisations', { servicesPath })

  await app.getService('organisations').configureOrganisations()
}
