'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var servicesPath = _path2.default.join(__dirname, '..', '..', 'services');
var modelsPath = _path2.default.join(__dirname, '..', '..', 'models');

var debug = (0, _debug2.default)('kalisio:kTeam:organisations');

exports.default = {
  createOrganisationServices: function createOrganisationServices(organisation) {
    var organisationDb = this.app.db.instance.db(organisation._id.toString());
    this.app.createService('users', {
      servicesPath: servicesPath,
      path: organisation._id.toString() + '/users',
      proxy: {
        service: this.app.getService('users'),
        params: { query: { 'organisations._id': organisation._id.toString() } }
      }
    });
    debug('Users service created for organisation ' + organisation.name);
    this.app.createService('groups', {
      modelsPath: modelsPath,
      servicesPath: servicesPath,
      path: organisation._id.toString() + '/groups',
      db: organisationDb
    });
    debug('Groups service created for organisation ' + organisation.name);
  },
  configureOrganisations: function configureOrganisations() {
    var _this = this;

    // Reinstanciated services for all organisations
    return this.find({ paginate: false }).then(function (organisations) {
      organisations.forEach(function (organisation) {
        return _this.createOrganisationServices(organisation);
      });
    });
  }
};
module.exports = exports['default'];
//# sourceMappingURL=organisations.service.js.map