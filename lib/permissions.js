'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RESOURCE_TYPE = exports.Roles = undefined;
exports.defineResourceRules = defineResourceRules;
exports.defineAnonymousAbilitiesForSubject = defineAnonymousAbilitiesForSubject;
exports.defineUserAbilitiesForSubject = defineUserAbilitiesForSubject;
exports.defineOrganisationAbilitiesForSubject = defineOrganisationAbilitiesForSubject;
exports.defineGroupAbilitiesForSubject = defineGroupAbilitiesForSubject;
exports.defineAbilitiesForSubject = defineAbilitiesForSubject;
exports.hasAbilities = hasAbilities;

var _casl = require('casl');

// Define some alias to simplify ability definitions
_casl.Ability.addAlias('update', 'patch');
_casl.Ability.addAlias('read', ['get', 'find']);
_casl.Ability.addAlias('remove', 'delete');

var Roles = exports.Roles = {
  member: 0,
  manager: 1,
  owner: 2

  // Hooks that can be added to customize abilities computation
};var hooks = [];

// Get the unique global symbol to store resource type on a resource object
var RESOURCE_TYPE = exports.RESOURCE_TYPE = 'type';

function defineResourceRules(subject, resource, resourceService, can) {
  var role = Roles[resource.permissions];

  if (role >= Roles.member) {
    can('read', resourceService, { _id: resource._id.toString() });
  }
  if (role >= Roles.manager) {
    can('update', resourceService, { _id: resource._id.toString() });
    can('manage', 'authorisations', { resource: resource._id.toString() });
  }
  if (role >= Roles.owner) {
    can('remove', resourceService, { _id: resource._id.toString() });
  }
}

// Hook computing anonymous abilities for a given user
function defineAnonymousAbilitiesForSubject(subject, can, cannot) {
  // Register
  can('create', 'users');
}

// Hook computing default abilities for a given user
function defineUserAbilitiesForSubject(subject, can, cannot) {
  if (subject) {
    // Read/Update profile
    can(['update', 'remove'], 'users', { _id: subject._id.toString() });
    // Create new organisations and associated DB
    can('create', 'organisations');
  }
}

// Hook computing organisation abilities for a given user
function defineOrganisationAbilitiesForSubject(subject, can, cannot) {
  if (subject && subject.organisations) {
    subject.organisations.forEach(function (organisation) {
      // Generic rules for resources
      defineResourceRules(subject, organisation, 'organisations', can);
      // Specific rules for organiations
      var role = Roles[organisation.permissions];
      if (role >= Roles.manager) {
        can('create', 'groups', { organisation: organisation._id.toString() });
      }
    });
  }
}

// Hook computing group abilities for a given user
function defineGroupAbilitiesForSubject(subject, can, cannot) {
  if (subject && subject.groups) {
    subject.groups.forEach(function (group) {
      // Generic rules for resources
      defineResourceRules(subject, group, 'groups', can);
      // Np specific rules for groups
    });
  }
}

// Compute abilities for a given user
function defineAbilitiesForSubject(subject) {
  var _AbilityBuilder$extra = _casl.AbilityBuilder.extract(),
      rules = _AbilityBuilder$extra.rules,
      can = _AbilityBuilder$extra.can,
      cannot = _AbilityBuilder$extra.cannot;

  // Run registered hooks


  hooks.forEach(function (hook) {
    return hook(subject, can, cannot);
  });

  // CASL cannot infer the object type from the object itself so we need
  // to tell it how he can find the object type, i.e. service name
  return new _casl.Ability(rules, { subjectName: function subjectName(resource) {
      if (!resource || typeof resource === 'string') {
        return resource;
      }
      return resource[Symbol.for(RESOURCE_TYPE)];
    } });
}

defineAbilitiesForSubject.registerHook = function (hook) {
  if (!hooks.includes(hook)) {
    hooks.push(hook);
  }
};

defineAbilitiesForSubject.unregisterHook = function (hook) {
  hooks = hooks.filter(function (registeredHook) {
    return registeredHook !== hook;
  });
};

function hasAbilities(abilities, action, resource, serviceName) {
  resource[Symbol.for(RESOURCE_TYPE)] = serviceName;
  var result = abilities.can(action, resource);
  // Not required anymore
  delete resource[Symbol.for(RESOURCE_TYPE)];
  return result;
}

// Register all default hooks
// Default rules for unauthenticated users
defineAbilitiesForSubject.registerHook(defineAnonymousAbilitiesForSubject);
// Default rules for all authenticated users
defineAbilitiesForSubject.registerHook(defineUserAbilitiesForSubject);
// Then rules for organisations
defineAbilitiesForSubject.registerHook(defineOrganisationAbilitiesForSubject);
// Then rules for groups
defineAbilitiesForSubject.registerHook(defineGroupAbilitiesForSubject);
//# sourceMappingURL=permissions.js.map