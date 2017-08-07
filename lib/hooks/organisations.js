'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOrganisationServices = createOrganisationServices;
exports.removeOrganisationServices = removeOrganisationServices;
exports.createOrganisationAuthorisations = createOrganisationAuthorisations;
exports.removeOrganisationAuthorisations = removeOrganisationAuthorisations;
exports.createPrivateOrganisation = createPrivateOrganisation;
exports.removePrivateOrganisation = removePrivateOrganisation;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('kaelia:kTeam');
var servicesPath = _path2.default.join(__dirname, '..', 'services');
var modelsPath = _path2.default.join(__dirname, '..', 'models');

function createOrganisationServices(hook) {
  var app = hook.app;
  var databaseService = app.getService('databases');

  // First we create the organisation DB
  return databaseService.create({
    name: hook.result._id.toString()
  }, {
    user: hook.params.user
  }).then(function (db) {
    debug('DB created for organisation ' + hook.result.name);
    var organisationDb = app.db.instance.db(hook.result._id.toString());
    app.createService('users', {
      servicesPath: servicesPath,
      path: hook.result._id.toString() + '/users',
      proxy: {
        service: app.getService('users'),
        params: { query: { 'organisations._id': hook.result._id.toString() } }
      }
    });
    app.createService('groups', {
      modelsPath: modelsPath,
      servicesPath: servicesPath,
      path: hook.result._id.toString() + '/groups',
      db: organisationDb
    });
    return hook;
  });
}

function removeOrganisationServices(hook) {
  var app = hook.app;
  var databaseService = app.getService('databases');

  // Then we remove the organisation DB
  return databaseService.remove(hook.result._id.toString(), {
    user: hook.params.user
  }).then(function (db) {
    debug('DB removed for organisation ' + hook.result.name);
    return hook;
  });
}

function createOrganisationAuthorisations(hook) {
  var app = hook.app;
  var authorisationService = app.getService('authorisations');
  var userService = app.getService('users');

  // Set membership for the owner
  return authorisationService.create({
    scope: 'organisations',
    permissions: 'owner' // Owner by default
  }, {
    user: hook.params.user,
    // Because we already have subject/resource set it as objects to avoid populating
    subjects: [hook.params.user],
    subjectsService: userService,
    resource: hook.result,
    resourcesService: hook.service
  }).then(function (authorisation) {
    debug('Organisation ownership set for user ' + hook.result._id);
    return hook;
  });
}

function removeOrganisationAuthorisations(hook) {
  var app = hook.app;
  var authorisationService = app.getService('authorisations');

  // Unset membership for the all org users
  return authorisationService.remove(hook.result._id.toString(), {
    query: {
      subjectsService: hook.result._id.toString() + '/users',
      scope: 'organisations'
    },
    user: hook.params.user
  }).then(function (authorisation) {
    debug('Authorisations unset for organisation ' + hook.result._id);
    return hook;
  });
}

function createPrivateOrganisation(hook) {
  var app = hook.app;
  var organisationService = app.getService('organisations');

  // Create a private organisation for the user
  return organisationService.create({
    _id: hook.result._id, // Same ID as user, fine because in another service
    name: hook.result.name // Same name as user
  }, {
    user: hook.result
  }).then(function (org) {
    debug('Private organisation created for user ' + hook.result._id);
  });
}

function removePrivateOrganisation(hook) {
  var app = hook.app;
  var organisationService = app.getService('organisations');
  // Create a private organisation for the user
  return organisationService.remove(hook.result._id.toString(), {
    user: hook.result
  }).then(function (org) {
    debug('Private organisation removed for user ' + hook.result._id);
  });
}