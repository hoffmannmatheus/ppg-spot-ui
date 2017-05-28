var _decode = require('./decode');

var _decode2 = babelHelpers.interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _InstallationController = require('./InstallationController');

var _InstallationController2 = babelHelpers.interopRequireDefault(_InstallationController);

var _ParseOp = require('./ParseOp');

var ParseOp = babelHelpers.interopRequireWildcard(_ParseOp);

var _RESTController = require('./RESTController');

var _RESTController2 = babelHelpers.interopRequireDefault(_RESTController);

var Parse = {
  initialize: function initialize(applicationId, javaScriptKey) {
    Parse._initialize(applicationId, javaScriptKey);
  },
  _initialize: function _initialize(applicationId, javaScriptKey, masterKey) {
    _CoreManager2.default.set('APPLICATION_ID', applicationId);
    _CoreManager2.default.set('JAVASCRIPT_KEY', javaScriptKey);
    _CoreManager2.default.set('MASTER_KEY', masterKey);
    _CoreManager2.default.set('USE_MASTER_KEY', false);
  }
};

Object.defineProperty(Parse, 'applicationId', {
  get: function get() {
    return _CoreManager2.default.get('APPLICATION_ID');
  },
  set: function set(value) {
    _CoreManager2.default.set('APPLICATION_ID', value);
  }
});
Object.defineProperty(Parse, 'javaScriptKey', {
  get: function get() {
    return _CoreManager2.default.get('JAVASCRIPT_KEY');
  },
  set: function set(value) {
    _CoreManager2.default.set('JAVASCRIPT_KEY', value);
  }
});
Object.defineProperty(Parse, 'masterKey', {
  get: function get() {
    return _CoreManager2.default.get('MASTER_KEY');
  },
  set: function set(value) {
    _CoreManager2.default.set('MASTER_KEY', value);
  }
});
Object.defineProperty(Parse, 'serverURL', {
  get: function get() {
    return _CoreManager2.default.get('SERVER_URL');
  },
  set: function set(value) {
    _CoreManager2.default.set('SERVER_URL', value);
  }
});
Object.defineProperty(Parse, 'liveQueryServerURL', {
  get: function get() {
    return _CoreManager2.default.get('LIVEQUERY_SERVER_URL');
  },
  set: function set(value) {
    _CoreManager2.default.set('LIVEQUERY_SERVER_URL', value);
  }
});


Parse.ACL = require('./ParseACL').default;
Parse.Analytics = require('./Analytics');
Parse.Cloud = require('./Cloud');
Parse.CoreManager = require('./CoreManager');
Parse.Config = require('./ParseConfig').default;
Parse.Error = require('./ParseError').default;
Parse.FacebookUtils = require('./FacebookUtils').default;
Parse.File = require('./ParseFile').default;
Parse.GeoPoint = require('./ParseGeoPoint').default;
Parse.Installation = require('./ParseInstallation').default;
Parse.Object = require('./ParseObject').default;
Parse.Op = {
  Set: ParseOp.SetOp,
  Unset: ParseOp.UnsetOp,
  Increment: ParseOp.IncrementOp,
  Add: ParseOp.AddOp,
  Remove: ParseOp.RemoveOp,
  AddUnique: ParseOp.AddUniqueOp,
  Relation: ParseOp.RelationOp
};
Parse.Promise = require('./ParsePromise').default;
Parse.Push = require('./Push');
Parse.Query = require('./ParseQuery').default;
Parse.Relation = require('./ParseRelation').default;
Parse.Role = require('./ParseRole').default;
Parse.Session = require('./ParseSession').default;
Parse.Storage = require('./Storage');
Parse.User = require('./ParseUser').default;
Parse.LiveQuery = require('./ParseLiveQuery').default;
Parse.LiveQueryClient = require('./LiveQueryClient').default;

Parse._request = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _CoreManager2.default.getRESTController().request.apply(null, args);
};
Parse._ajax = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return _CoreManager2.default.getRESTController().ajax.apply(null, args);
};

Parse._decode = function (_, value) {
  return (0, _decode2.default)(value);
};
Parse._encode = function (value, _, disallowObjects) {
  return (0, _encode2.default)(value, disallowObjects);
};
Parse._getInstallationId = function () {
  return _CoreManager2.default.getInstallationController().currentInstallationId();
};

_CoreManager2.default.setInstallationController(_InstallationController2.default);
_CoreManager2.default.setRESTController(_RESTController2.default);

Parse.Parse = Parse;

module.exports = Parse;