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
    create: [_hooks.createGroupAuthorisations],
    update: [],
    patch: [],
    remove: [_hooks.removeGroupAuthorisations]
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
//# sourceMappingURL=groups.hooks.js.map