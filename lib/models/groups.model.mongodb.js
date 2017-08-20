'use strict';

module.exports = function (app, options) {
  var db = options.db || app.db;
  options.Model = db.collection('groups');
};
//# sourceMappingURL=groups.model.mongodb.js.map