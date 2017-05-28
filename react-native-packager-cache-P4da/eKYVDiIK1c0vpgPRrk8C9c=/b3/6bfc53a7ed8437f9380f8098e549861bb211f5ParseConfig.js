Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _decode = require('./decode');

var _decode2 = babelHelpers.interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _escape2 = require('./escape');

var _escape3 = babelHelpers.interopRequireDefault(_escape2);

var _ParseError = require('./ParseError');

var _ParseError2 = babelHelpers.interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _Storage = require('./Storage');

var _Storage2 = babelHelpers.interopRequireDefault(_Storage);

var ParseConfig = function () {
  function ParseConfig() {
    babelHelpers.classCallCheck(this, ParseConfig);

    this.attributes = {};
    this._escapedAttributes = {};
  }

  babelHelpers.createClass(ParseConfig, [{
    key: 'get',
    value: function get(attr) {
      return this.attributes[attr];
    }
  }, {
    key: 'escape',
    value: function escape(attr) {
      var html = this._escapedAttributes[attr];
      if (html) {
        return html;
      }
      var val = this.attributes[attr];
      var escaped = '';
      if (val != null) {
        escaped = (0, _escape3.default)(val.toString());
      }
      this._escapedAttributes[attr] = escaped;
      return escaped;
    }
  }], [{
    key: 'current',
    value: function current() {
      var controller = _CoreManager2.default.getConfigController();
      return controller.current();
    }
  }, {
    key: 'get',
    value: function get(options) {
      options = options || {};

      var controller = _CoreManager2.default.getConfigController();
      return controller.get()._thenRunCallbacks(options);
    }
  }]);
  return ParseConfig;
}();

exports.default = ParseConfig;


var currentConfig = null;

var CURRENT_CONFIG_KEY = 'currentConfig';

function decodePayload(data) {
  try {
    var json = JSON.parse(data);
    if (json && typeof json === 'object') {
      return (0, _decode2.default)(json);
    }
  } catch (e) {
    return null;
  }
}

var DefaultController = {
  current: function current() {
    if (currentConfig) {
      return currentConfig;
    }

    var config = new ParseConfig();
    var storagePath = _Storage2.default.generatePath(CURRENT_CONFIG_KEY);
    var configData;
    if (!_Storage2.default.async()) {
      configData = _Storage2.default.getItem(storagePath);

      if (configData) {
        var attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    }

    return _Storage2.default.getItemAsync(storagePath).then(function (configData) {
      if (configData) {
        var attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    });
  },
  get: function get() {
    var RESTController = _CoreManager2.default.getRESTController();

    return RESTController.request('GET', 'config', {}, {}).then(function (response) {
      if (!response || !response.params) {
        var error = new _ParseError2.default(_ParseError2.default.INVALID_JSON, 'Config JSON response invalid.');
        return _ParsePromise2.default.error(error);
      }

      var config = new ParseConfig();
      config.attributes = {};
      for (var attr in response.params) {
        config.attributes[attr] = (0, _decode2.default)(response.params[attr]);
      }
      currentConfig = config;
      return _Storage2.default.setItemAsync(_Storage2.default.generatePath(CURRENT_CONFIG_KEY), JSON.stringify(response.params)).then(function () {
        return config;
      });
    });
  }
};

_CoreManager2.default.setConfigController(DefaultController);