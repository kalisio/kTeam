'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixins = undefined;

var _permissions = require('../permissions');

Object.keys(_permissions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _permissions[key];
    }
  });
});
exports.default = init;

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _quasar = require('quasar');

var _client = require('kCore/client');

var _mixins2 = require('./mixins');

var _mixins = _interopRequireWildcard(_mixins2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We faced a bug in babel so that transform-runtime with export * from 'x' generates import statements in transpiled code
// Tracked here : https://github.com/babel/babel/issues/2877
// We tested the workaround given here https://github.com/babel/babel/issues/2877#issuecomment-270700000 with success so far
exports.mixins = _mixins;
function init() {
  // const app = this

  _quasar.Events.$on('user-changed', function (user) {
    if (user.organisations && user.organisations.length > 0) {
      _client.Store.set('organisation', user.organisations[0]);
    } else {
      _loglevel2.default.debug('empty organisations');
    }
  });

  _loglevel2.default.debug('Initializing kalisio team');
}
//# sourceMappingURL=index.js.map