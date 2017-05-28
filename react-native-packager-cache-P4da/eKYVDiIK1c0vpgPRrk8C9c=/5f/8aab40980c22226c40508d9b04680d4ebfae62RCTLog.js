
'use strict';

var BatchedBridge = require('BatchedBridge');

var invariant = require('fbjs/lib/invariant');

var levelsMap = {
  log: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error'
};

var RCTLog = function () {
  function RCTLog() {
    babelHelpers.classCallCheck(this, RCTLog);
  }

  babelHelpers.createClass(RCTLog, null, [{
    key: 'logIfNoNativeHook',
    value: function logIfNoNativeHook() {
      if (typeof global.nativeLoggingHook === 'undefined') {
        RCTLog.logToConsole.apply(RCTLog, arguments);
      }

      return true;
    }
  }, {
    key: 'logToConsole',
    value: function logToConsole(level) {
      var _console;

      var logFn = levelsMap[level];
      invariant(logFn, 'Level "' + level + '" not one of ' + Object.keys(levelsMap));

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_console = console)[logFn].apply(_console, args);

      return true;
    }
  }]);
  return RCTLog;
}();

BatchedBridge.registerCallableModule('RCTLog', RCTLog);

module.exports = RCTLog;