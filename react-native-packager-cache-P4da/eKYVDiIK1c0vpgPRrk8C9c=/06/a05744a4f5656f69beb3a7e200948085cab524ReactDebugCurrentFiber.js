

'use strict';

if (__DEV__) {
  var getComponentName = require('getComponentName');

  var _require = require('ReactFiberComponentTreeHook'),
      getStackAddendumByWorkInProgressFiber = _require.getStackAddendumByWorkInProgressFiber;
}

function getCurrentFiberOwnerName() {
  if (__DEV__) {
    var fiber = ReactDebugCurrentFiber.current;
    if (fiber === null) {
      return null;
    }
    if (fiber._debugOwner != null) {
      return getComponentName(fiber._debugOwner);
    }
  }
  return null;
}

function getCurrentFiberStackAddendum() {
  if (__DEV__) {
    var fiber = ReactDebugCurrentFiber.current;
    if (fiber === null) {
      return null;
    }

    return getStackAddendumByWorkInProgressFiber(fiber);
  }
  return null;
}

var ReactDebugCurrentFiber = {
  current: null,
  phase: null,

  getCurrentFiberOwnerName: getCurrentFiberOwnerName,
  getCurrentFiberStackAddendum: getCurrentFiberStackAddendum
};

module.exports = ReactDebugCurrentFiber;