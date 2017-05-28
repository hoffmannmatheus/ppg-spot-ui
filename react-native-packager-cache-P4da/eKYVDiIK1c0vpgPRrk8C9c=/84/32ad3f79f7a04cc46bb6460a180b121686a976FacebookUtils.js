Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parseDate = require('./parseDate');

var _parseDate2 = babelHelpers.interopRequireDefault(_parseDate);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = babelHelpers.interopRequireDefault(_ParseUser);

var PUBLIC_KEY = "*";

var initialized = false;
var requestedPermissions;
var initOptions;
var provider = {
  authenticate: function authenticate(options) {
    var _this = this;

    if (typeof FB === 'undefined') {
      options.error(this, 'Facebook SDK not found.');
    }
    FB.login(function (response) {
      if (response.authResponse) {
        if (options.success) {
          options.success(_this, {
            id: response.authResponse.userID,
            access_token: response.authResponse.accessToken,
            expiration_date: new Date(response.authResponse.expiresIn * 1000 + new Date().getTime()).toJSON()
          });
        }
      } else {
        if (options.error) {
          options.error(_this, response);
        }
      }
    }, {
      scope: requestedPermissions
    });
  },
  restoreAuthentication: function restoreAuthentication(authData) {
    if (authData) {
      var expiration = (0, _parseDate2.default)(authData.expiration_date);
      var expiresIn = expiration ? (expiration.getTime() - new Date().getTime()) / 1000 : 0;

      var authResponse = {
        userID: authData.id,
        accessToken: authData.access_token,
        expiresIn: expiresIn
      };
      var newOptions = {};
      if (initOptions) {
        for (var key in initOptions) {
          newOptions[key] = initOptions[key];
        }
      }
      newOptions.authResponse = authResponse;

      newOptions.status = false;

      var existingResponse = FB.getAuthResponse();
      if (existingResponse && existingResponse.userID !== authResponse.userID) {
        FB.logout();
      }

      FB.init(newOptions);
    }
    return true;
  },
  getAuthType: function getAuthType() {
    return 'facebook';
  },
  deauthenticate: function deauthenticate() {
    this.restoreAuthentication(null);
  }
};

var FacebookUtils = {
  init: function init(options) {
    if (typeof FB === 'undefined') {
      throw new Error('The Facebook JavaScript SDK must be loaded before calling init.');
    }
    initOptions = {};
    if (options) {
      for (var key in options) {
        initOptions[key] = options[key];
      }
    }
    if (initOptions.status && typeof console !== 'undefined') {
      var warn = console.warn || console.log || function () {};
      warn.call(console, 'The "status" flag passed into' + ' FB.init, when set to true, can interfere with Parse Facebook' + ' integration, so it has been suppressed. Please call' + ' FB.getLoginStatus() explicitly if you require this behavior.');
    }
    initOptions.status = false;
    FB.init(initOptions);
    _ParseUser2.default._registerAuthenticationProvider(provider);
    initialized = true;
  },
  isLinked: function isLinked(user) {
    return user._isLinked('facebook');
  },
  logIn: function logIn(permissions, options) {
    if (!permissions || typeof permissions === 'string') {
      if (!initialized) {
        throw new Error('You must initialize FacebookUtils before calling logIn.');
      }
      requestedPermissions = permissions;
      return _ParseUser2.default._logInWith('facebook', options);
    } else {
      var newOptions = {};
      if (options) {
        for (var key in options) {
          newOptions[key] = options[key];
        }
      }
      newOptions.authData = permissions;
      return _ParseUser2.default._logInWith('facebook', newOptions);
    }
  },
  link: function link(user, permissions, options) {
    if (!permissions || typeof permissions === 'string') {
      if (!initialized) {
        throw new Error('You must initialize FacebookUtils before calling link.');
      }
      requestedPermissions = permissions;
      return user._linkWith('facebook', options);
    } else {
      var newOptions = {};
      if (options) {
        for (var key in options) {
          newOptions[key] = options[key];
        }
      }
      newOptions.authData = permissions;
      return user._linkWith('facebook', newOptions);
    }
  },

  unlink: function unlink(user, options) {
    if (!initialized) {
      throw new Error('You must initialize FacebookUtils before calling unlink.');
    }
    return user._unlinkFrom('facebook', options);
  }
};

exports.default = FacebookUtils;