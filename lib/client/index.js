'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _permissions = require('./permissions');

Object.keys(_permissions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _permissions[key];
    }
  });
});
//# sourceMappingURL=index.js.map