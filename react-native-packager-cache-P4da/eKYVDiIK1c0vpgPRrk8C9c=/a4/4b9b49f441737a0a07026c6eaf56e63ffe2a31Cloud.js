Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _decode = require('./decode');

var _decode2 = babelHelpers.interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _ParseError = require('./ParseError');

var _ParseError2 = babelHelpers.interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

function run(name, data, options) {
  options = options || {};

  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud function name must be a string.');
  }

  var requestOptions = {};
  if (options.useMasterKey) {
    requestOptions.useMasterKey = options.useMasterKey;
  }
  if (options.sessionToken) {
    requestOptions.sessionToken = options.sessionToken;
  }

  return _CoreManager2.default.getCloudController().run(name, data, requestOptions)._thenRunCallbacks(options);
}

var DefaultController = {
  run: function run(name, data, options) {
    var RESTController = _CoreManager2.default.getRESTController();

    var payload = (0, _encode2.default)(data, true);

    var requestOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      requestOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      requestOptions.sessionToken = options.sessionToken;
    }

    var request = RESTController.request('POST', 'functions/' + name, payload, requestOptions);

    return request.then(function (res) {
      var decoded = (0, _decode2.default)(res);
      if (decoded && decoded.hasOwnProperty('result')) {
        return _ParsePromise2.default.as(decoded.result);
      }
      return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.INVALID_JSON, 'The server returned an invalid response.'));
    })._thenRunCallbacks(options);
  }
};

_CoreManager2.default.setCloudController(DefaultController);