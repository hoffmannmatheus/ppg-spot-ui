Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = equals;

var _ParseACL = require('./ParseACL');

var _ParseACL2 = babelHelpers.interopRequireDefault(_ParseACL);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = babelHelpers.interopRequireDefault(_ParseFile);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = babelHelpers.interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

function equals(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }

  if (!a || typeof a !== 'object') {
    return a === b;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (var i = a.length; i--;) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (a instanceof _ParseACL2.default || a instanceof _ParseFile2.default || a instanceof _ParseGeoPoint2.default || a instanceof _ParseObject2.default) {
    return a.equals(b);
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (var k in a) {
    if (!equals(a[k], b[k])) {
      return false;
    }
  }
  return true;
}