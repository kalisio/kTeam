'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = async function () {
  var app = this;
  var servicesPath = _path2.default.join(__dirname, '..', 'services');
  var modelsPath = _path2.default.join(__dirname, '..', 'models');

  // Create services to manage MongoDB databases, organisations, authorisations, etc.
  app.createService('databases', { servicesPath: servicesPath });
  app.createService('organisations', { modelsPath: modelsPath, servicesPath: servicesPath });
  app.createService('authorisations', { servicesPath: servicesPath });
  // Add hook to automatically creates a new organisation when creating a new user
  app.configureService('users', app.getService('users'), servicesPath);

  await app.getService('organisations').configureOrganisations();
};
//# sourceMappingURL=index.js.map