'use strict';

var _hooks = require('../../hooks');

var authenticate = require('feathers-authentication').hooks.authenticate;

module.exports = {
  before: {
    all: [authenticate('jwt')],
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
    create: [_hooks.createOrganisationServices, _hooks.createOrganisationAuthorisations],
    update: [],
    patch: [],
    remove: [_hooks.removeOrganisationServices, _hooks.removeOrganisationAuthorisations]
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
};
//# sourceMappingURL=organisations.hooks.js.map