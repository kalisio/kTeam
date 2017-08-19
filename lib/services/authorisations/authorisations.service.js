'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sift = require('sift');

var _sift2 = _interopRequireDefault(_sift);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _permissions = require('../../permissions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('kaelia:kTeam:authorisation');

// Global key to store abilities in cache for anonymous users
var ANONYMOUS_USER = 'anonymous';

// Util function to look for a given resource in a scope
function findResource(scope, query) {
  var results = (0, _sift2.default)(query, scope);
  return results.length > 0 ? results[0] : null;
}

exports.default = {
  // Used to change permissions for a subject on a resource
  // We pass parameters in the query/data object
  // The params object should be already filled by populate hooks
  create: function create(data, params) {
    var _this = this;

    var query = params.query;
    // Make hook usable with query params as well
    var scopeName = data.scope || query.scope; // Get scope name first
    return Promise.all(params.subjects.map(function (subject) {
      // Then retrieve the right scope on the subject
      var scope = _lodash2.default.get(subject, scopeName, []);
      // Then the target resource
      var resource = findResource(scope, { _id: params.resource._id.toString() });
      // On first authorisation create the resource in scope
      if (!resource) {
        resource = {
          name: params.resource.name,
          _id: params.resource._id.toString()
        };
        scope.push(resource);
      }
      // Hooks should have populate subject/resource,
      // now we have to set permissions on the given subject's scope
      resource.permissions = data.permissions || query.permissions;
      // This cover the case when we create the scope on the first auth,
      // so that if the caller want to get back the update subject he can have it
      _lodash2.default.set(subject, scopeName, scope);
      _this.updateAbilitiesForSubject(subject);
      return params.subjectsService.patch(subject._id, (0, _defineProperty3.default)({}, scopeName, scope), {
        user: params.user
      }).then(function (subject) {
        debug('Authorisation ' + data.permissions + ' set for subject ' + subject._id + ' on resource ' + params.resource._id + ' with scope ' + scopeName);
      });
    }));
  },


  // Used to remove permissions for a subject on a resource
  // We use ID as target resource and pass parameters in the query object
  // The params object should be already filled by populate hooks
  remove: function remove(id, params) {
    var _this2 = this;

    var query = params.query;
    var scopeName = query.scope; // Get scope name first
    return Promise.all(params.subjects.map(function (subject) {
      // Then retrieve the right scope on the subject
      var scope = _lodash2.default.get(subject, scopeName, []);
      // Then the target resource
      scope.filter((0, _sift2.default)({ _id: id }));
      // This cover the case when we create the scope on the first auth,
      // so that if the caller want to get back the update subject he can have it
      _lodash2.default.set(subject, scopeName, scope);
      _this2.updateAbilitiesForSubject(subject);
      return params.subjectsService.patch(subject._id, (0, _defineProperty3.default)({}, scopeName, scope), {
        user: params.user
      }).then(function (subject) {
        debug('Authorisation unset for subject ' + subject._id + ' on resource ' + id + ' with scope ' + scopeName);
      });
    }));
  },
  setup: function setup(app) {
    var config = app.get('authorisation');
    if (config && config.cache) {
      // Store abilities of the N most active users in LRU cache (defaults to 1000)
      this.cache = new _lruCache2.default(config.cache.maxUsers || 1000);
      debug('Using LRU cache for user abilities');
    } else {
      debug('Do not use LRU cache for user abilities');
    }
  },


  // Compute abilities for a given user and set it in cache the first time
  // or get it from cache if found
  getAbilitiesForSubject: function getAbilitiesForSubject(subject) {
    if (this.cache) {
      if (subject) {
        if (this.cache.has(subject._id.toString())) return this.cache.get(subject._id.toString());
      } else {
        if (this.cache.has(ANONYMOUS_USER)) return this.cache.get(ANONYMOUS_USER);
      }
    }

    var abilities = (0, _permissions.defineAbilitiesForSubject)(subject);

    if (this.cache) {
      if (subject) {
        this.cache.set(subject._id.toString(), abilities);
      } else {
        this.cache.set(ANONYMOUS_USER, abilities);
      }
    }

    return abilities;
  },


  // Compute abilities for a given user and update it in cache
  updateAbilitiesForSubject: function updateAbilitiesForSubject(subject) {
    if (this.cache) {
      if (subject) {
        this.cache.del(subject._id.toString());
      } else {
        this.cache.del(ANONYMOUS_USER);
      }
    }

    return this.getAbilitiesForSubject(subject);
  }
};
module.exports = exports['default'];