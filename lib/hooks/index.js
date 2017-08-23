'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _authorisations = require('./authorisations');

Object.keys(_authorisations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _authorisations[key];
    }
  });
});

var _organisations = require('./organisations');

Object.keys(_organisations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _organisations[key];
    }
  });
});

var _groups = require('./groups');

Object.keys(_groups).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _groups[key];
    }
  });
});

var _users = require('./users');

Object.keys(_users).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _users[key];
    }
  });
});
//# sourceMappingURL=index.js.map