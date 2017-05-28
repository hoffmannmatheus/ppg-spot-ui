

'use strict';

var invariant = require('fbjs/lib/invariant');

var caughtError = null;

var _invokeGuardedCallback = function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
  var funcArgs = Array.prototype.slice.call(arguments, 3);
  try {
    func.apply(context, funcArgs);
  } catch (error) {
    return error;
  }
  return null;
};

if (__DEV__) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
    var fakeNode = document.createElement('react');
    var depth = 0;

    _invokeGuardedCallback = function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
      depth++;
      var thisDepth = depth;
      var funcArgs = Array.prototype.slice.call(arguments, 3);
      var boundFunc = function boundFunc() {
        func.apply(context, funcArgs);
      };
      var fakeEventError = null;
      var onFakeEventError = function onFakeEventError(event) {
        if (depth === thisDepth) {
          fakeEventError = event.error;
        }
      };
      var evtType = 'react-' + (name ? name : 'invokeguardedcallback') + '-' + depth;
      window.addEventListener('error', onFakeEventError);
      fakeNode.addEventListener(evtType, boundFunc, false);
      var evt = document.createEvent('Event');
      evt.initEvent(evtType, false, false);
      fakeNode.dispatchEvent(evt);
      fakeNode.removeEventListener(evtType, boundFunc, false);
      window.removeEventListener('error', onFakeEventError);
      depth--;
      return fakeEventError;
    };
  }
}

var _rethrowCaughtError = function _rethrowCaughtError() {
  if (caughtError) {
    var error = caughtError;
    caughtError = null;
    throw error;
  }
};

var ReactErrorUtils = {
  injection: {
    injectErrorUtils: function injectErrorUtils(injectedErrorUtils) {
      invariant(typeof injectedErrorUtils.invokeGuardedCallback === 'function', 'Injected invokeGuardedCallback() must be a function.');
      _invokeGuardedCallback = injectedErrorUtils.invokeGuardedCallback;
    }
  },

  invokeGuardedCallback: function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
    return _invokeGuardedCallback.apply(this, arguments);
  },

  invokeGuardedCallbackAndCatchFirstError: function invokeGuardedCallbackAndCatchFirstError(name, func, context, a, b, c, d, e, f) {
    var error = ReactErrorUtils.invokeGuardedCallback.apply(this, arguments);
    if (error !== null && caughtError === null) {
      caughtError = error;
    }
  },

  rethrowCaughtError: function rethrowCaughtError() {
    return _rethrowCaughtError.apply(this, arguments);
  }
};

module.exports = ReactErrorUtils;