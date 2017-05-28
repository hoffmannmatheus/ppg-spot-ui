

'use strict';

var ReactDebugCurrentFrame = {};

if (process.env.NODE_ENV !== 'production') {
  var _require = require('./ReactComponentTreeHook'),
      getStackAddendumByID = _require.getStackAddendumByID,
      getCurrentStackAddendum = _require.getCurrentStackAddendum;

  var _require2 = require('./ReactFiberComponentTreeHook'),
      getStackAddendumByWorkInProgressFiber = _require2.getStackAddendumByWorkInProgressFiber;

  ReactDebugCurrentFrame.current = null;

  ReactDebugCurrentFrame.element = null;

  ReactDebugCurrentFrame.getStackAddendum = function () {
    var stack = null;
    var current = ReactDebugCurrentFrame.current;
    var element = ReactDebugCurrentFrame.element;
    if (current !== null) {
      if (typeof current === 'number') {
        var debugID = current;
        stack = getStackAddendumByID(debugID);
      } else if (typeof current.tag === 'number') {
        var workInProgress = current;
        stack = getStackAddendumByWorkInProgressFiber(workInProgress);
      }
    } else if (element !== null) {
      stack = getCurrentStackAddendum(element);
    }
    return stack;
  };
}

module.exports = ReactDebugCurrentFrame;