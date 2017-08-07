'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _quasar = require('quasar');

var _client = require('kCore/client');

var _permissions = require('../../permissions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authorisationMixin = {
  methods: {
    hasAbilities: function hasAbilities(action, resource, serviceName) {
      var abilities = _client.Store.get('user.abilities', null);
      if (abilities) {
        return (0, _permissions.hasAbilities)(abilities, action, resource, serviceName);
      }
      return false;
    },
    updateAbilities: function updateAbilities() {
      var user = _client.Store.get('user', null);
      var abilities = null;
      if (user) {
        abilities = (0, _permissions.defineAbilitiesForSubject)(user);
        _client.Store.set('user.abilities', abilities);
      }
      return abilities;
    }
  },
  mounted: function mounted() {
    var _this = this;

    // Check if abilities are already computed
    var abilities = _client.Store.get('user.abilities', null);
    if (!abilities) {
      // Otherwise try to compute them
      abilities = this.updateAbilities();
      _loglevel2.default.debug('New user abilities: ', abilities.rules);
    }
    // Whenever the user is updated, update abilities as well
    _quasar.Events.$on('user-changed', function (user) {
      var abilities = _this.updateAbilities();
      _loglevel2.default.debug('New user abilities: ', abilities.rules);
    });
  }
};

_client.Store.set('mixins.authorisation', authorisationMixin);

exports.default = authorisationMixin;
module.exports = exports['default'];