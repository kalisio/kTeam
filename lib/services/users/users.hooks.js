'use strict';

var _hooks = require('../../hooks');

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
    create: [_hooks.updateAbilities, _hooks.createPrivateOrganisation],
    update: [],
    patch: [],
    remove: [_hooks.removePrivateOrganisation]
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