Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.send = send;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = babelHelpers.interopRequireDefault(_ParseQuery);

function send(data, options) {
  options = options || {};

  if (data.where && data.where instanceof _ParseQuery2.default) {
    data.where = data.where.toJSON().where;
  }

  if (data.push_time && typeof data.push_time === 'object') {
    data.push_time = data.push_time.toJSON();
  }

  if (data.expiration_time && typeof data.expiration_time === 'object') {
    data.expiration_time = data.expiration_time.toJSON();
  }

  if (data.expiration_time && data.expiration_interval) {
    throw new Error('expiration_time and expiration_interval cannot both be set.');
  }

  return _CoreManager2.default.getPushController().send(data, {
    useMasterKey: options.useMasterKey
  })._thenRunCallbacks(options);
}

var DefaultController = {
  send: function send(data, options) {
    var RESTController = _CoreManager2.default.getRESTController();

    var request = RESTController.request('POST', 'push', data, { useMasterKey: !!options.useMasterKey });

    return request._thenRunCallbacks(options);
  }
};

_CoreManager2.default.setPushController(DefaultController);