Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = decode;

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

function decode(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    var dup = [];
    value.forEach(function (v, i) {
      dup[i] = decode(v);
    });
    return dup;
  }
  if (typeof value.__op === 'string') {
    return (0, _ParseOp.opFromJSON)(value);
  }
  if (value.__type === 'Pointer' && value.className) {
    return _ParseObject2.default.fromJSON(value);
  }
  if (value.__type === 'Object' && value.className) {
    return _ParseObject2.default.fromJSON(value);
  }
  if (value.__type === 'Relation') {
    var relation = new _ParseRelation2.default(null, null);
    relation.targetClassName = value.className;
    return relation;
  }
  if (value.__type === 'Date') {
    return new Date(value.iso);
  }
  if (value.__type === 'File') {
    return _ParseFile2.default.fromJSON(value);
  }
  if (value.__type === 'GeoPoint') {
    return new _ParseGeoPoint2.default({
      latitude: value.latitude,
      longitude: value.longitude
    });
  }
  var copy = {};
  for (var k in value) {
    copy[k] = decode(value[k]);
  }
  return copy;
}