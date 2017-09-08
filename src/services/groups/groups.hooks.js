import { hooks } from 'kCore'
import { createGroupAuthorisations, removeGroupAuthorisations } from '../../hooks'
const { authenticate } = require('feathers-authentication').hooks

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [ hooks.updateTags ],
    update: [ hooks.updateTags ],
    patch: [ hooks.updateTags ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ createGroupAuthorisations ],
    update: [],
    patch: [],
    remove: [ hooks.updateTags, removeGroupAuthorisations ]
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
