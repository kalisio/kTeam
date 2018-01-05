import { createOrganisationServices, removeOrganisationServices, createOrganisationAuthorisations, removeOrganisationAuthorisations } from '../../hooks'

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ createOrganisationServices, createOrganisationAuthorisations ],
    update: [],
    patch: [],
    remove: [ removeOrganisationServices, removeOrganisationAuthorisations ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
