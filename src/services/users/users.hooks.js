import { updateAbilities, createPrivateOrganisation, removePrivateOrganisation } from '../../hooks'

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
    create: [ updateAbilities, createPrivateOrganisation ],
    update: [],
    patch: [],
    remove: [ removePrivateOrganisation ]
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
