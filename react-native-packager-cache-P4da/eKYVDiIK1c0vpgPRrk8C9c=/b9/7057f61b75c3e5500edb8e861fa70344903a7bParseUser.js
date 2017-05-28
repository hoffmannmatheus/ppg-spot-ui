Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _isRevocableSession = require('./isRevocableSession');

var _isRevocableSession2 = babelHelpers.interopRequireDefault(_isRevocableSession);

var _ParseError = require('./ParseError');

var _ParseError2 = babelHelpers.interopRequireDefault(_ParseError);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = babelHelpers.interopRequireDefault(_ParseObject2);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _ParseSession = require('./ParseSession');

var _ParseSession2 = babelHelpers.interopRequireDefault(_ParseSession);

var _Storage = require('./Storage');

var _Storage2 = babelHelpers.interopRequireDefault(_Storage);

var CURRENT_USER_KEY = 'currentUser';
var canUseCurrentUser = !_CoreManager2.default.get('IS_NODE');
var currentUserCacheMatchesDisk = false;
var currentUserCache = null;

var authProviders = {};

var ParseUser = function (_ParseObject) {
  babelHelpers.inherits(ParseUser, _ParseObject);

  function ParseUser(attributes) {
    babelHelpers.classCallCheck(this, ParseUser);

    var _this = babelHelpers.possibleConstructorReturn(this, (ParseUser.__proto__ || Object.getPrototypeOf(ParseUser)).call(this, '_User'));

    if (attributes && typeof attributes === 'object') {
      if (!_this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Parse User');
      }
    }
    return _this;
  }

  babelHelpers.createClass(ParseUser, [{
    key: '_upgradeToRevocableSession',
    value: function _upgradeToRevocableSession(options) {
      options = options || {};

      var upgradeOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        upgradeOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2.default.getUserController();
      return controller.upgradeToRevocableSession(this, upgradeOptions)._thenRunCallbacks(options);
    }
  }, {
    key: '_linkWith',
    value: function _linkWith(provider, options) {
      var _this2 = this;

      var authType;
      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }
      if (options && options.hasOwnProperty('authData')) {
        var authData = this.get('authData') || {};
        if (typeof authData !== 'object') {
          throw new Error('Invalid type: authData field should be an object');
        }
        authData[authType] = options.authData;

        var controller = _CoreManager2.default.getUserController();
        return controller.linkWith(this, authData)._thenRunCallbacks(options, this);
      } else {
        var promise = new _ParsePromise2.default();
        provider.authenticate({
          success: function success(provider, result) {
            var opts = {};
            opts.authData = result;
            if (options.success) {
              opts.success = options.success;
            }
            if (options.error) {
              opts.error = options.error;
            }
            _this2._linkWith(provider, opts).then(function () {
              promise.resolve(_this2);
            }, function (error) {
              promise.reject(error);
            });
          },
          error: function error(provider, _error) {
            if (typeof options.error === 'function') {
              options.error(_this2, _error);
            }
            promise.reject(_error);
          }
        });
        return promise;
      }
    }
  }, {
    key: '_synchronizeAuthData',
    value: function _synchronizeAuthData(provider) {
      if (!this.isCurrent() || !provider) {
        return;
      }
      var authType;
      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[authType];
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData');
      if (!provider || !authData || typeof authData !== 'object') {
        return;
      }
      var success = provider.restoreAuthentication(authData[authType]);
      if (!success) {
        this._unlinkFrom(provider);
      }
    }
  }, {
    key: '_synchronizeAllAuthData',
    value: function _synchronizeAllAuthData() {
      var authData = this.get('authData');
      if (typeof authData !== 'object') {
        return;
      }

      for (var key in authData) {
        this._synchronizeAuthData(key);
      }
    }
  }, {
    key: '_cleanupAuthData',
    value: function _cleanupAuthData() {
      if (!this.isCurrent()) {
        return;
      }
      var authData = this.get('authData');
      if (typeof authData !== 'object') {
        return;
      }

      for (var key in authData) {
        if (!authData[key]) {
          delete authData[key];
        }
      }
    }
  }, {
    key: '_unlinkFrom',
    value: function _unlinkFrom(provider, options) {
      var _this3 = this;

      if (typeof provider === 'string') {
        provider = authProviders[provider];
      } else {
        provider.getAuthType();
      }
      return this._linkWith(provider, { authData: null }).then(function () {
        _this3._synchronizeAuthData(provider);
        return _ParsePromise2.default.as(_this3);
      })._thenRunCallbacks(options);
    }
  }, {
    key: '_isLinked',
    value: function _isLinked(provider) {
      var authType;
      if (typeof provider === 'string') {
        authType = provider;
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData') || {};
      if (typeof authData !== 'object') {
        return false;
      }
      return !!authData[authType];
    }
  }, {
    key: '_logOutWithAll',
    value: function _logOutWithAll() {
      var authData = this.get('authData');
      if (typeof authData !== 'object') {
        return;
      }

      for (var key in authData) {
        this._logOutWith(key);
      }
    }
  }, {
    key: '_logOutWith',
    value: function _logOutWith(provider) {
      if (!this.isCurrent()) {
        return;
      }
      if (typeof provider === 'string') {
        provider = authProviders[provider];
      }
      if (provider && provider.deauthenticate) {
        provider.deauthenticate();
      }
    }
  }, {
    key: '_preserveFieldsOnFetch',
    value: function _preserveFieldsOnFetch() {
      return {
        sessionToken: this.get('sessionToken')
      };
    }
  }, {
    key: 'isCurrent',
    value: function isCurrent() {
      var current = ParseUser.current();
      return !!current && current.id === this.id;
    }
  }, {
    key: 'getUsername',
    value: function getUsername() {
      var username = this.get('username');
      if (username == null || typeof username === 'string') {
        return username;
      }
      return '';
    }
  }, {
    key: 'setUsername',
    value: function setUsername(username) {
      var authData = this.get('authData');
      if (authData && typeof authData === 'object' && authData.hasOwnProperty('anonymous')) {
        authData.anonymous = null;
      }
      this.set('username', username);
    }
  }, {
    key: 'setPassword',
    value: function setPassword(password) {
      this.set('password', password);
    }
  }, {
    key: 'getEmail',
    value: function getEmail() {
      var email = this.get('email');
      if (email == null || typeof email === 'string') {
        return email;
      }
      return '';
    }
  }, {
    key: 'setEmail',
    value: function setEmail(email) {
      this.set('email', email);
    }
  }, {
    key: 'getSessionToken',
    value: function getSessionToken() {
      var token = this.get('sessionToken');
      if (token == null || typeof token === 'string') {
        return token;
      }
      return '';
    }
  }, {
    key: 'authenticated',
    value: function authenticated() {
      var current = ParseUser.current();
      return !!this.get('sessionToken') && !!current && current.id === this.id;
    }
  }, {
    key: 'signUp',
    value: function signUp(attrs, options) {
      options = options || {};

      var signupOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        signupOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('installationId')) {
        signupOptions.installationId = options.installationId;
      }

      var controller = _CoreManager2.default.getUserController();
      return controller.signUp(this, attrs, signupOptions)._thenRunCallbacks(options, this);
    }
  }, {
    key: 'logIn',
    value: function logIn(options) {
      options = options || {};

      var loginOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        loginOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('installationId')) {
        loginOptions.installationId = options.installationId;
      }

      var controller = _CoreManager2.default.getUserController();
      return controller.logIn(this, loginOptions)._thenRunCallbacks(options, this);
    }
  }, {
    key: 'save',
    value: function save() {
      var _this4 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return babelHelpers.get(ParseUser.prototype.__proto__ || Object.getPrototypeOf(ParseUser.prototype), 'save', this).apply(this, args).then(function () {
        if (_this4.isCurrent()) {
          return _CoreManager2.default.getUserController().updateUserOnDisk(_this4);
        }
        return _this4;
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this5 = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return babelHelpers.get(ParseUser.prototype.__proto__ || Object.getPrototypeOf(ParseUser.prototype), 'destroy', this).apply(this, args).then(function () {
        if (_this5.isCurrent()) {
          return _CoreManager2.default.getUserController().removeUserFromDisk();
        }
        return _this5;
      });
    }
  }, {
    key: 'fetch',
    value: function fetch() {
      var _this6 = this;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return babelHelpers.get(ParseUser.prototype.__proto__ || Object.getPrototypeOf(ParseUser.prototype), 'fetch', this).apply(this, args).then(function () {
        if (_this6.isCurrent()) {
          return _CoreManager2.default.getUserController().updateUserOnDisk(_this6);
        }
        return _this6;
      });
    }
  }], [{
    key: 'readOnlyAttributes',
    value: function readOnlyAttributes() {
      return ['sessionToken'];
    }
  }, {
    key: 'extend',
    value: function extend(protoProps, classProps) {
      if (protoProps) {
        for (var prop in protoProps) {
          if (prop !== 'className') {
            Object.defineProperty(ParseUser.prototype, prop, {
              value: protoProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      if (classProps) {
        for (var prop in classProps) {
          if (prop !== 'className') {
            Object.defineProperty(ParseUser, prop, {
              value: classProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      return ParseUser;
    }
  }, {
    key: 'current',
    value: function current() {
      if (!canUseCurrentUser) {
        return null;
      }
      var controller = _CoreManager2.default.getUserController();
      return controller.currentUser();
    }
  }, {
    key: 'currentAsync',
    value: function currentAsync() {
      if (!canUseCurrentUser) {
        return _ParsePromise2.default.as(null);
      }
      var controller = _CoreManager2.default.getUserController();
      return controller.currentUserAsync();
    }
  }, {
    key: 'signUp',
    value: function signUp(username, password, attrs, options) {
      attrs = attrs || {};
      attrs.username = username;
      attrs.password = password;
      var user = new ParseUser(attrs);
      return user.signUp({}, options);
    }
  }, {
    key: 'logIn',
    value: function logIn(username, password, options) {
      if (typeof username !== 'string') {
        return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'Username must be a string.'));
      } else if (typeof password !== 'string') {
        return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'Password must be a string.'));
      }
      var user = new ParseUser();
      user._finishFetch({ username: username, password: password });
      return user.logIn(options);
    }
  }, {
    key: 'become',
    value: function become(sessionToken, options) {
      if (!canUseCurrentUser) {
        throw new Error('It is not memory-safe to become a user in a server environment');
      }
      options = options || {};

      var becomeOptions = {
        sessionToken: sessionToken
      };
      if (options.hasOwnProperty('useMasterKey')) {
        becomeOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2.default.getUserController();
      return controller.become(becomeOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'logInWith',
    value: function logInWith(provider, options) {
      return ParseUser._logInWith(provider, options);
    }
  }, {
    key: 'logOut',
    value: function logOut() {
      if (!canUseCurrentUser) {
        throw new Error('There is no current user user on a node.js server environment.');
      }

      var controller = _CoreManager2.default.getUserController();
      return controller.logOut();
    }
  }, {
    key: 'requestPasswordReset',
    value: function requestPasswordReset(email, options) {
      options = options || {};

      var requestOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        requestOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2.default.getUserController();
      return controller.requestPasswordReset(email, requestOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'allowCustomUserClass',
    value: function allowCustomUserClass(isAllowed) {
      _CoreManager2.default.set('PERFORM_USER_REWRITE', !isAllowed);
    }
  }, {
    key: 'enableRevocableSession',
    value: function enableRevocableSession(options) {
      options = options || {};
      _CoreManager2.default.set('FORCE_REVOCABLE_SESSION', true);
      if (canUseCurrentUser) {
        var current = ParseUser.current();
        if (current) {
          return current._upgradeToRevocableSession(options);
        }
      }
      return _ParsePromise2.default.as()._thenRunCallbacks(options);
    }
  }, {
    key: 'enableUnsafeCurrentUser',
    value: function enableUnsafeCurrentUser() {
      canUseCurrentUser = true;
    }
  }, {
    key: 'disableUnsafeCurrentUser',
    value: function disableUnsafeCurrentUser() {
      canUseCurrentUser = false;
    }
  }, {
    key: '_registerAuthenticationProvider',
    value: function _registerAuthenticationProvider(provider) {
      authProviders[provider.getAuthType()] = provider;

      ParseUser.currentAsync().then(function (current) {
        if (current) {
          current._synchronizeAuthData(provider.getAuthType());
        }
      });
    }
  }, {
    key: '_logInWith',
    value: function _logInWith(provider, options) {
      var user = new ParseUser();
      return user._linkWith(provider, options);
    }
  }, {
    key: '_clearCache',
    value: function _clearCache() {
      currentUserCache = null;
      currentUserCacheMatchesDisk = false;
    }
  }, {
    key: '_setCurrentUserCache',
    value: function _setCurrentUserCache(user) {
      currentUserCache = user;
    }
  }]);
  return ParseUser;
}(_ParseObject3.default);

exports.default = ParseUser;


_ParseObject3.default.registerSubclass('_User', ParseUser);

var DefaultController = {
  updateUserOnDisk: function updateUserOnDisk(user) {
    var path = _Storage2.default.generatePath(CURRENT_USER_KEY);
    var json = user.toJSON();
    json.className = '_User';
    return _Storage2.default.setItemAsync(path, JSON.stringify(json)).then(function () {
      return user;
    });
  },
  removeUserFromDisk: function removeUserFromDisk() {
    var path = _Storage2.default.generatePath(CURRENT_USER_KEY);
    currentUserCacheMatchesDisk = true;
    currentUserCache = null;
    return _Storage2.default.removeItemAsync(path);
  },
  setCurrentUser: function setCurrentUser(user) {
    currentUserCache = user;
    user._cleanupAuthData();
    user._synchronizeAllAuthData();
    return DefaultController.updateUserOnDisk(user);
  },
  currentUser: function currentUser() {
    if (currentUserCache) {
      return currentUserCache;
    }
    if (currentUserCacheMatchesDisk) {
      return null;
    }
    if (_Storage2.default.async()) {
      throw new Error('Cannot call currentUser() when using a platform with an async ' + 'storage system. Call currentUserAsync() instead.');
    }
    var path = _Storage2.default.generatePath(CURRENT_USER_KEY);
    var userData = _Storage2.default.getItem(path);
    currentUserCacheMatchesDisk = true;
    if (!userData) {
      currentUserCache = null;
      return null;
    }
    userData = JSON.parse(userData);
    if (!userData.className) {
      userData.className = '_User';
    }
    if (userData._id) {
      if (userData.objectId !== userData._id) {
        userData.objectId = userData._id;
      }
      delete userData._id;
    }
    if (userData._sessionToken) {
      userData.sessionToken = userData._sessionToken;
      delete userData._sessionToken;
    }
    var current = _ParseObject3.default.fromJSON(userData);
    currentUserCache = current;
    current._synchronizeAllAuthData();
    return current;
  },
  currentUserAsync: function currentUserAsync() {
    if (currentUserCache) {
      return _ParsePromise2.default.as(currentUserCache);
    }
    if (currentUserCacheMatchesDisk) {
      return _ParsePromise2.default.as(null);
    }
    var path = _Storage2.default.generatePath(CURRENT_USER_KEY);
    return _Storage2.default.getItemAsync(path).then(function (userData) {
      currentUserCacheMatchesDisk = true;
      if (!userData) {
        currentUserCache = null;
        return _ParsePromise2.default.as(null);
      }
      userData = JSON.parse(userData);
      if (!userData.className) {
        userData.className = '_User';
      }
      if (userData._id) {
        if (userData.objectId !== userData._id) {
          userData.objectId = userData._id;
        }
        delete userData._id;
      }
      if (userData._sessionToken) {
        userData.sessionToken = userData._sessionToken;
        delete userData._sessionToken;
      }
      var current = _ParseObject3.default.fromJSON(userData);
      currentUserCache = current;
      current._synchronizeAllAuthData();
      return _ParsePromise2.default.as(current);
    });
  },
  signUp: function signUp(user, attrs, options) {
    var username = attrs && attrs.username || user.get('username');
    var password = attrs && attrs.password || user.get('password');

    if (!username || !username.length) {
      return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'Cannot sign up user with an empty name.'));
    }
    if (!password || !password.length) {
      return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'Cannot sign up user with an empty password.'));
    }

    return user.save(attrs, options).then(function () {
      user._finishFetch({ password: undefined });

      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  },
  logIn: function logIn(user, options) {
    var RESTController = _CoreManager2.default.getRESTController();
    var stateController = _CoreManager2.default.getObjectStateController();
    var auth = {
      username: user.get('username'),
      password: user.get('password')
    };
    return RESTController.request('GET', 'login', auth, options).then(function (response, status) {
      user._migrateId(response.objectId);
      user._setExisted(true);
      stateController.setPendingOp(user._getStateIdentifier(), 'username', undefined);
      stateController.setPendingOp(user._getStateIdentifier(), 'password', undefined);
      response.password = undefined;
      user._finishFetch(response);
      if (!canUseCurrentUser) {
        return _ParsePromise2.default.as(user);
      }
      return DefaultController.setCurrentUser(user);
    });
  },
  become: function become(options) {
    var user = new ParseUser();
    var RESTController = _CoreManager2.default.getRESTController();
    return RESTController.request('GET', 'users/me', {}, options).then(function (response, status) {
      user._finishFetch(response);
      user._setExisted(true);
      return DefaultController.setCurrentUser(user);
    });
  },
  logOut: function logOut() {
    return DefaultController.currentUserAsync().then(function (currentUser) {
      var path = _Storage2.default.generatePath(CURRENT_USER_KEY);
      var promise = _Storage2.default.removeItemAsync(path);
      var RESTController = _CoreManager2.default.getRESTController();
      if (currentUser !== null) {
        var currentSession = currentUser.getSessionToken();
        if (currentSession && (0, _isRevocableSession2.default)(currentSession)) {
          promise = promise.then(function () {
            return RESTController.request('POST', 'logout', {}, { sessionToken: currentSession });
          });
        }
        currentUser._logOutWithAll();
        currentUser._finishFetch({ sessionToken: undefined });
      }
      currentUserCacheMatchesDisk = true;
      currentUserCache = null;

      return promise;
    });
  },
  requestPasswordReset: function requestPasswordReset(email, options) {
    var RESTController = _CoreManager2.default.getRESTController();
    return RESTController.request('POST', 'requestPasswordReset', { email: email }, options);
  },
  upgradeToRevocableSession: function upgradeToRevocableSession(user, options) {
    var token = user.getSessionToken();
    if (!token) {
      return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.SESSION_MISSING, 'Cannot upgrade a user with no session token'));
    }

    options.sessionToken = token;

    var RESTController = _CoreManager2.default.getRESTController();
    return RESTController.request('POST', 'upgradeToRevocableSession', {}, options).then(function (result) {
      var session = new _ParseSession2.default();
      session._finishFetch(result);
      user._finishFetch({ sessionToken: session.getSessionToken() });
      if (user.isCurrent()) {
        return DefaultController.setCurrentUser(user);
      }
      return _ParsePromise2.default.as(user);
    });
  },
  linkWith: function linkWith(user, authData) {
    return user.save({ authData: authData }).then(function () {
      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  }
};

_CoreManager2.default.setUserController(DefaultController);