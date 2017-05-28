

'use strict';

var _require = require('ReactFiber'),
    createHostRootFiber = _require.createHostRootFiber;

exports.createFiberRoot = function (containerInfo) {
  var uninitializedFiber = createHostRootFiber();
  var root = {
    current: uninitializedFiber,
    containerInfo: containerInfo,
    isScheduled: false,
    nextScheduledRoot: null,
    context: null,
    pendingContext: null
  };
  uninitializedFiber.stateNode = root;
  return root;
};