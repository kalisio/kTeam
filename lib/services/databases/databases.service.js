'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, app, options) {
  return _feathersMongodbManagement2.default.database({ db: app.db._db });
};

var _feathersMongodbManagement = require('feathers-mongodb-management');

var _feathersMongodbManagement2 = _interopRequireDefault(_feathersMongodbManagement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
//# sourceMappingURL=databases.service.js.map