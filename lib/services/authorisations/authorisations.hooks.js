'use strict';

var _hooks = require('../../hooks');

var authenticate = require('feathers-authentication').hooks.authenticate;

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [_hooks.populateSubjects, _hooks.populateResource],
    update: [],
    patch: [],
    remove: [_hooks.populateSubjects]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
//# sourceMappingURL=authorisations.hooks.js.map