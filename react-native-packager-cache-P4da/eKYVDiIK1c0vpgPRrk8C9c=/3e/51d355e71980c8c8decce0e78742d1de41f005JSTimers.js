
'use strict';

var JSTimersExecution = require('JSTimersExecution');
var Platform = require('Platform');

var _require = require('NativeModules'),
    Timing = _require.Timing;

function _getFreeIndex() {
  var freeIndex = JSTimersExecution.timerIDs.indexOf(null);
  if (freeIndex === -1) {
    freeIndex = JSTimersExecution.timerIDs.length;
  }
  return freeIndex;
}

function _allocateCallback(func, type) {
  var id = JSTimersExecution.GUID++;
  var freeIndex = _getFreeIndex();
  JSTimersExecution.timerIDs[freeIndex] = id;
  JSTimersExecution.callbacks[freeIndex] = func;
  JSTimersExecution.types[freeIndex] = type;
  if (__DEV__) {
    var parseErrorStack = require('parseErrorStack');
    var e = new Error();
    e.framesToPop = 1;
    var stack = parseErrorStack(e);
    if (stack) {
      JSTimersExecution.identifiers[freeIndex] = stack.shift();
    }
  }
  return id;
}

function _freeCallback(timerID) {
  if (timerID == null) {
    return;
  }

  var index = JSTimersExecution.timerIDs.indexOf(timerID);

  if (index !== -1) {
    JSTimersExecution._clearIndex(index);
    var type = JSTimersExecution.types[index];
    if (type !== 'setImmediate' && type !== 'requestIdleCallback') {
      Timing.deleteTimer(timerID);
    }
  }
}

var MAX_TIMER_DURATION_MS = 60 * 1000;
var IS_ANDROID = Platform.OS === 'android';
var ANDROID_LONG_TIMER_MESSAGE = 'Setting a timer for a long period of time, i.e. multiple minutes, is a ' + 'performance and correctness issue on Android as it keeps the timer ' + 'module awake, and timers can only be called when the app is in the foreground. ' + 'See https://github.com/facebook/react-native/issues/12981 for more info.';

var JSTimers = {
  setTimeout: function setTimeout(func, duration) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (__DEV__ && IS_ANDROID && duration > MAX_TIMER_DURATION_MS) {
      console.warn(ANDROID_LONG_TIMER_MESSAGE + '\n' + '(Saw setTimeout with duration ' + duration + 'ms)');
    }
    var id = _allocateCallback(function () {
      return func.apply(undefined, args);
    }, 'setTimeout');
    Timing.createTimer(id, duration || 0, Date.now(), false);
    return id;
  },

  setInterval: function setInterval(func, duration) {
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    if (__DEV__ && IS_ANDROID && duration > MAX_TIMER_DURATION_MS) {
      console.warn(ANDROID_LONG_TIMER_MESSAGE + '\n' + '(Saw setInterval with duration ' + duration + 'ms)');
    }
    var id = _allocateCallback(function () {
      return func.apply(undefined, args);
    }, 'setInterval');
    Timing.createTimer(id, duration || 0, Date.now(), true);
    return id;
  },

  setImmediate: function setImmediate(func) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    var id = _allocateCallback(function () {
      return func.apply(undefined, args);
    }, 'setImmediate');
    JSTimersExecution.immediates.push(id);
    return id;
  },

  requestAnimationFrame: function requestAnimationFrame(func) {
    var id = _allocateCallback(func, 'requestAnimationFrame');
    Timing.createTimer(id, 1, Date.now(), false);
    return id;
  },

  requestIdleCallback: function requestIdleCallback(func) {
    if (JSTimersExecution.requestIdleCallbacks.length === 0) {
      Timing.setSendIdleEvents(true);
    }

    var id = _allocateCallback(func, 'requestIdleCallback');
    JSTimersExecution.requestIdleCallbacks.push(id);
    return id;
  },

  cancelIdleCallback: function cancelIdleCallback(timerID) {
    _freeCallback(timerID);
    var index = JSTimersExecution.requestIdleCallbacks.indexOf(timerID);
    if (index !== -1) {
      JSTimersExecution.requestIdleCallbacks.splice(index, 1);
    }

    if (JSTimersExecution.requestIdleCallbacks.length === 0) {
      Timing.setSendIdleEvents(false);
    }
  },

  clearTimeout: function clearTimeout(timerID) {
    _freeCallback(timerID);
  },

  clearInterval: function clearInterval(timerID) {
    _freeCallback(timerID);
  },

  clearImmediate: function clearImmediate(timerID) {
    _freeCallback(timerID);
    var index = JSTimersExecution.immediates.indexOf(timerID);
    if (index !== -1) {
      JSTimersExecution.immediates.splice(index, 1);
    }
  },

  cancelAnimationFrame: function cancelAnimationFrame(timerID) {
    _freeCallback(timerID);
  }
};

module.exports = JSTimers;