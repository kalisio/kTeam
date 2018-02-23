import path from 'path'
import makeDebug from 'debug'
import aws from 'aws-sdk'
import store from 's3-blob-store'
import BlobService from 'feathers-blob'
import { createTagService, createStorageService } from 'kCore'
const servicesPath = path.join(__dirname, '..', '..', 'services')
const modelsPath = path.join(__dirname, '..', '..', 'models')

const debug = makeDebug('kalisio:kTeam:organisations:service')

export default function (name, app, options) {
  const config = app.get('storage')
  const client = new aws.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  })
  const bucket = config.bucket
  debug('S3 storage created with config ', config)

  return {
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
      const config = this.app.get('storage')
      const blobStore = store({ client, bucket })
      const blobService = BlobService({ Model: blobStore, id: '_id' })
      createStorageService.call(this.app, blobService, organisation)
      debug('Storage service created for organisation ' + organisation.name)
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
}