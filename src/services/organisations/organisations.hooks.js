import { hooks } from 'kCore'
import { createOrganisationServices, removeOrganisationServices, createOrganisationAuthorisations, removeOrganisationAuthorisations } from '../../hooks'
const { authenticate } = require('feathers-authentication').hooks

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ hooks.processObjectIDs ],
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
