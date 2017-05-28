Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _isRevocableSession = require('./isRevocableSession');

var _isRevocableSession2 = babelHelpers.interopRequireDefault(_isRevocableSession);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = babelHelpers.interopRequireDefault(_ParseObject2);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = babelHelpers.interopRequireDefault(_ParseUser);

var ParseSession = function (_ParseObject) {
  babelHelpers.inherits(ParseSession, _ParseObject);

  function ParseSession(attributes) {
    babelHelpers.classCallCheck(this, ParseSession);

    var _this = babelHelpers.possibleConstructorReturn(this, (ParseSession.__proto__ || Object.getPrototypeOf(ParseSession)).call(this, '_Session'));

    if (attributes && typeof attributes === 'object') {
      if (!_this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
    return _this;
  }

  babelHelpers.createClass(ParseSession, [{
    key: 'getSessionToken',
    value: function getSessionToken() {
      var token = this.get('sessionToken');
      if (typeof token === 'string') {
        return token;
      }
      return '';
    }
  }], [{
    key: 'readOnlyAttributes',
    value: function readOnlyAttributes() {
      return ['createdWith', 'expiresAt', 'installationId', 'restricted', 'sessionToken', 'user'];
    }
  }, {
    key: 'current',
    value: function current(options) {
      options = options || {};
      var controller = _CoreManager2.default.getSessionController();

      var sessionOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        sessionOptions.useMasterKey = options.useMasterKey;
      }
      return _ParseUser2.default.currentAsync().then(function (user) {
        if (!user) {
          return _ParsePromise2.default.error('There is no current user.');
        }
        user.getSessionToken();

        sessionOptions.sessionToken = user.getSessionToken();
        return controller.getSession(sessionOptions);
      });
    }
  }, {
    key: 'isCurrentSessionRevocable',
    value: function isCurrentSessionRevocable() {
      var currentUser = _ParseUser2.default.current();
      if (currentUser) {
        return (0, _isRevocableSession2.default)(currentUser.getSessionToken() || '');
      }
      return false;
    }
  }]);
  return ParseSession;
}(_ParseObject3.default);

exports.default = ParseSession;


_ParseObject3.default.registerSubclass('_Session', ParseSession);

var DefaultController = {
  getSession: function getSession(options) {
    var RESTController = _CoreManager2.default.getRESTController();
    var session = new ParseSession();

    return RESTController.request('GET', 'sessions/me', {}, options).then(function (sessionData) {
      session._finishFetch(sessionData);
      session._setExisted(true);
      return session;
    });
  }
};

_CoreManager2.default.setSessionController(DefaultController);