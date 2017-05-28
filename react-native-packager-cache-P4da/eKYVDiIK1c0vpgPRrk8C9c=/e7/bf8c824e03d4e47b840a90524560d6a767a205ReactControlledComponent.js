

'use strict';

var EventPluginUtils = require('EventPluginUtils');

var invariant = require('fbjs/lib/invariant');

var fiberHostComponent = null;

var ReactControlledComponentInjection = {
  injectFiberControlledHostComponent: function injectFiberControlledHostComponent(hostComponentImpl) {
    fiberHostComponent = hostComponentImpl;
  }
};

var restoreTarget = null;
var restoreQueue = null;

function restoreStateOfTarget(target) {
  var internalInstance = EventPluginUtils.getInstanceFromNode(target);
  if (!internalInstance) {
    return;
  }
  if (typeof internalInstance.tag === 'number') {
    invariant(fiberHostComponent && typeof fiberHostComponent.restoreControlledState === 'function', 'Fiber needs to be injected to handle a fiber target for controlled ' + 'events.');
    var props = EventPluginUtils.getFiberCurrentPropsFromNode(internalInstance.stateNode);
    fiberHostComponent.restoreControlledState(internalInstance.stateNode, internalInstance.type, props);
    return;
  }
  invariant(typeof internalInstance.restoreControlledState === 'function', 'The internal instance must be a React host component.');

  internalInstance.restoreControlledState();
}

var ReactControlledComponent = {
  injection: ReactControlledComponentInjection,

  enqueueStateRestore: function enqueueStateRestore(target) {
    if (restoreTarget) {
      if (restoreQueue) {
        restoreQueue.push(target);
      } else {
        restoreQueue = [target];
      }
    } else {
      restoreTarget = target;
    }
  },
  restoreStateIfNeeded: function restoreStateIfNeeded() {
    if (!restoreTarget) {
      return;
    }
    var target = restoreTarget;
    var queuedTargets = restoreQueue;
    restoreTarget = null;
    restoreQueue = null;

    restoreStateOfTarget(target);
    if (queuedTargets) {
      for (var i = 0; i < queuedTargets.length; i++) {
        restoreStateOfTarget(queuedTargets[i]);
      }
    }
  }
};

module.exports = ReactControlledComponent;