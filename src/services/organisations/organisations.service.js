import path from 'path'
import makeDebug from 'debug'
const servicesPath = path.join(__dirname, '..', '..', 'services')
const modelsPath = path.join(__dirname, '..', '..', 'models')

const debug = makeDebug('kaelia:kTeam:organisations')

export default {

  createOrganisationServices (organisation) {
    let organisationDb = this.app.db.instance.db(organisation._id.toString())
    this.app.createService('users', {
      servicesPath,
      path: organisation._id.toString() + '/users',
      proxy: {
        service: this.app.getService('users'),
        params: { query: { 'organisations._id': organisation._id.toString() } }
      }
    })
    debug('Users service created for organisation ' + organisation.name)
    this.app.createService('groups', {
      modelsPath,
      servicesPath,
      path: organisation._id.toString() + '/groups',
      db: organisationDb
    })
    debug('Groups service created for organisation ' + organisation.name)
  },

  configureOrganisations () {
    // Reinstanciated services for all organisations
    return this.find({ paginate: false })
    .then(organisations => {
      organisations.forEach(organisation => this.createOrganisationServices(organisation))
    })
  }
}
