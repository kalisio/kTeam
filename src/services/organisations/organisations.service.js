import path from 'path'
import makeDebug from 'debug'
import { createTagService } from 'kCore'
const servicesPath = path.join(__dirname, '..', '..', 'services')
const modelsPath = path.join(__dirname, '..', '..', 'models')

const debug = makeDebug('kalisio:kTeam:organisations')

export default {

  createOrganisationServices (organisation, db) {
    this.app.createService('members', {
      servicesPath,
      context: organisation,
      proxy: {
        service: this.app.getService('users'),
        params: { query: { 'organisations._id': organisation._id.toString() } }
      }
    })
    debug('Members service created for organisation ' + organisation.name)
    this.app.createService('groups', {
      modelsPath,
      servicesPath,
      context: organisation,
      db
    })
    debug('Groups service created for organisation ' + organisation.name)
    createTagService.call(this.app, organisation, db)
    debug('Tags service created for organisation ' + organisation.name)
  },

  removeOrganisationServices (organisation) {
    // TODO
  },

  configureOrganisations () {
    // Reinstanciated services for all organisations
    return this.find({ paginate: false })
    .then(organisations => {
      organisations.forEach(organisation => {
        // Get org DB
        let db = this.app.db.instance.db(organisation._id.toString())
        this.createOrganisationServices(organisation, db)
      })
    })
  }
}
