'use strict';

var _feathersHooksCommon = require('feathers-hooks-common');

module.exports = {
  before: {
    // Only used internally
    all: [(0, _feathersHooksCommon.disallow)('external')],
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