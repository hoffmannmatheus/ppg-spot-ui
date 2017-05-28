
'use strict';

var EventEmitter = require('EventEmitter');
var NativeEventEmitter = require('NativeEventEmitter');
var NativeModules = require('NativeModules');
var RCTAppState = NativeModules.AppState;

var logError = require('logError');
var invariant = require('fbjs/lib/invariant');

var AppState = function (_NativeEventEmitter) {
  babelHelpers.inherits(AppState, _NativeEventEmitter);

  function AppState() {
    babelHelpers.classCallCheck(this, AppState);

    var _this = babelHelpers.possibleConstructorReturn(this, (AppState.__proto__ || Object.getPrototypeOf(AppState)).call(this, RCTAppState));

    _this.isAvailable = true;
    _this._eventHandlers = {
      change: new Map(),
      memoryWarning: new Map()
    };

    _this.currentState = RCTAppState.initialAppState || 'active';

    _this.addListener('appStateDidChange', function (appStateData) {
      _this.currentState = appStateData.app_state;
    });

    RCTAppState.getCurrentAppState(function (appStateData) {
      _this.currentState = appStateData.app_state;
    }, logError);
    return _this;
  }

  babelHelpers.createClass(AppState, [{
    key: 'addEventListener',
    value: function addEventListener(type, handler) {
      invariant(['change', 'memoryWarning'].indexOf(type) !== -1, 'Trying to subscribe to unknown event: "%s"', type);
      if (type === 'change') {
        this._eventHandlers[type].set(handler, this.addListener('appStateDidChange', function (appStateData) {
          handler(appStateData.app_state);
        }));
      } else if (type === 'memoryWarning') {
        this._eventHandlers[type].set(handler, this.addListener('memoryWarning', handler));
      }
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, handler) {
      invariant(['change', 'memoryWarning'].indexOf(type) !== -1, 'Trying to remove listener for unknown event: "%s"', type);
      if (!this._eventHandlers[type].has(handler)) {
        return;
      }
      this._eventHandlers[type].get(handler).remove();
      this._eventHandlers[type].delete(handler);
    }
  }]);
  return AppState;
}(NativeEventEmitter);

function throwMissingNativeModule() {
  invariant(false, 'Cannot use AppState module when native RCTAppState is not included in the build.\n' + 'Either include it, or check AppState.isAvailable before calling any methods.');
}

var MissingNativeAppStateShim = function (_EventEmitter) {
  babelHelpers.inherits(MissingNativeAppStateShim, _EventEmitter);

  function MissingNativeAppStateShim() {
    var _ref;

    var _temp, _this2, _ret;

    babelHelpers.classCallCheck(this, MissingNativeAppStateShim);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = babelHelpers.possibleConstructorReturn(this, (_ref = MissingNativeAppStateShim.__proto__ || Object.getPrototypeOf(MissingNativeAppStateShim)).call.apply(_ref, [this].concat(args))), _this2), _this2.isAvailable = false, _this2.currentState = null, _temp), babelHelpers.possibleConstructorReturn(_this2, _ret);
  }

  babelHelpers.createClass(MissingNativeAppStateShim, [{
    key: 'addEventListener',
    value: function addEventListener() {
      throwMissingNativeModule();
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener() {
      throwMissingNativeModule();
    }
  }, {
    key: 'addListener',
    value: function addListener() {
      throwMissingNativeModule();
    }
  }, {
    key: 'removeAllListeners',
    value: function removeAllListeners() {
      throwMissingNativeModule();
    }
  }, {
    key: 'removeSubscription',
    value: function removeSubscription() {
      throwMissingNativeModule();
    }
  }]);
  return MissingNativeAppStateShim;
}(EventEmitter);

if (RCTAppState) {
  AppState = new AppState();
} else {
  AppState = new MissingNativeAppStateShim();
}

module.exports = AppState;