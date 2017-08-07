'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.populateSubjects = populateSubjects;
exports.populateResource = populateResource;
exports.authorise = authorise;

var _feathersCommons = require('feathers-commons');

var _feathersErrors = require('feathers-errors');

var _casl = require('casl');

var _kCore = require('kCore');

var _permissions = require('../permissions');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('kaelia:kTeam:authorisation');

function populateSubjects(hook) {
  if (hook.type !== 'before') {
    throw new Error('The \'populateSubjects\' hook should only be used as a \'before\' hook.');
  }

  return _kCore.hooks.populateObjects('subjectsService', 'subjects')(hook);
}

function populateResource(hook) {
  if (hook.type !== 'before') {
    throw new Error('The \'populateResource\' hook should only be used as a \'before\' hook.');
  }

  return _kCore.hooks.populateObject('resourcesService', 'resource')(hook);
}

function authorise(hook) {
  if (hook.type !== 'before') {
    throw new Error('The \'authorise\' hook should only be used as a \'before\' hook.');
  }

  // If called internally we skip authorisation unless explicitely asked for
  if (!hook.params.checkAuthorisation && (!hook.params.provider || hook.params.authorised)) {
    return Promise.resolve(hook);
  }

  var action = hook.method;
  var serviceName = hook.service.name;
  // Build ability for user
  var authorisationService = hook.app.getService('authorisations');
  var abilities = authorisationService.getAbilitiesForSubject(hook.params.user);
  hook.params.abilities = abilities;

  debug('User is ', hook.params.user);
  debug('User abilities are ', abilities.rules);

  if (!hook.id) {
    // In this specific case there is no query to be run,
    // simply check against the object we'd like to create
    if (action === 'create') {
      debug('Target resource is ', hook.data);
      if (!(0, _permissions.hasAbilities)(abilities, action, hook.data, serviceName)) {
        throw new _feathersErrors.Forbidden('You are not allowed to perform ' + action + ' action on service ' + serviceName);
      }
    } else {
      // When we find/update/patch/remove multiple items this ensures thet
      // only the ones authorised by constraints on the resources will be fetched
      // This avoid fetching all first then check it one by one
      var rules = abilities.rulesFor(action, serviceName);
      debug('Target resource rules are ', rules);
      (0, _feathersCommons.merge)(hook.params.query, (0, _casl.toMongoQuery)(rules));
    }
    // Some specific services might not expose a get function, in this case we can check for authorisation
    // this has to be implemented by the service itself
  } else if (typeof hook.service.get === 'function') {
    // In this case (single get/update/patch) we need to fetch the item first
    // Bypass authorisation otherwise we will loop infinitely
    hook.params.checkAuthorisation = false;
    return hook.service.get(hook.id, hook.params).then(function (resource) {
      debug('Target resource is ', resource);
      // Then check against the object we'd like to manage
      if (!(0, _permissions.hasAbilities)(abilities, action, resource, serviceName)) {
        throw new _feathersErrors.Forbidden('You are not allowed to perform ' + action + ' action on service ' + serviceName);
      }
      // Avoid fetching again the object in this case
      if (action === 'get') {
        hook.result = resource;
      }
      hook.params.authorised = true;
      return hook;
    });
  }

  hook.params.authorised = true;
  return Promise.resolve(hook);
}
//# sourceMappingURL=authorisations.js.map