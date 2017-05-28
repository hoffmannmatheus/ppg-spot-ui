Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value, disallowObjects, forcePointers, seen) {
  return encode(value, !!disallowObjects, !!forcePointers, seen || []);
};

var _ParseACL = require('./ParseACL');

var _ParseACL2 = babelHelpers.interopRequireDefault(_ParseACL);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = babelHelpers.interopRequireDefault(_ParseFile);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = babelHelpers.interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

var _ParseOp = require('./ParseOp');

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = babelHelpers.interopRequireDefault(_ParseRelation);

var toString = Object.prototype.toString;

function encode(value, disallowObjects, forcePointers, seen) {
  if (value instanceof _ParseObject2.default) {
    if (disallowObjects) {
      throw new Error('Parse Objects not allowed here');
    }
    var seenEntry = value.id ? value.className + ':' + value.id : value;
    if (forcePointers || !seen || seen.indexOf(seenEntry) > -1 || value.dirty() || Object.keys(value._getServerData()).length < 1) {
      return value.toPointer();
    }
    seen = seen.concat(seenEntry);
    return value._toFullJSON(seen);
  }
  if (value instanceof _ParseOp.Op || value instanceof _ParseACL2.default || value instanceof _ParseGeoPoint2.default || value instanceof _ParseRelation2.default) {
    return value.toJSON();
  }
  if (value instanceof _ParseFile2.default) {
    if (!value.url()) {
      throw new Error('Tried to encode an unsaved file.');
    }
    return value.toJSON();
  }
  if (toString.call(value) === '[object Date]') {
    if (isNaN(value)) {
      throw new Error('Tried to encode an invalid date.');
    }
    return { __type: 'Date', iso: value.toJSON() };
  }
  if (toString.call(value) === '[object RegExp]' && typeof value.source === 'string') {
    return value.source;
  }

  if (Array.isArray(value)) {
    return value.map(function (v) {
      return encode(v, disallowObjects, forcePointers, seen);
    });
  }

  if (value && typeof value === 'object') {
    var output = {};
    for (var k in value) {
      output[k] = encode(value[k], disallowObjects, forcePointers, seen);
    }
    return output;
  }

  return value;
}