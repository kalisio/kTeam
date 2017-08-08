'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGroupAuthorisations = createGroupAuthorisations;
exports.removeGroupAuthorisations = removeGroupAuthorisations;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('kaelia:kTeam');

function createGroupAuthorisations(hook) {
  var app = hook.app;
  var authorisationService = app.getService('authorisations');
  var userService = app.getService('users');

  // Set membership for the owner
  return authorisationService.create({
    scope: 'groups',
    permissions: 'owner'
  }, {
    user: hook.params.user,
    // Because we already have subject/resource set it as objects to avoid populating
    subjects: [hook.params.user],
    subjectsService: userService,
    resource: hook.result,
    resourcesService: hook.service
  }).then(function (authorisation) {
    debug('Group ownership set for user ' + hook.result._id);
    return hook;
  });
}

function removeGroupAuthorisations(hook) {
  var app = hook.app;
  var authorisationService = app.getService('authorisations');

  // Unset membership for the all org users
  return authorisationService.remove(hook.result._id.toString(), {
    query: {
      subjectsService: hook.result.organisation.toString() + '/users',
      scope: 'groups'
    },
    user: hook.params.user
  }).then(function (authorisation) {
    debug('Authorisations unset for group ' + hook.result._id);
    return hook;
  });
}
//# sourceMappingURL=groups.js.map