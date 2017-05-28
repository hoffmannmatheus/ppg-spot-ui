

'use strict';

var ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
var ReactInstanceMap = require('ReactInstanceMap');
var ReactInstrumentation = require('ReactInstrumentation');
var ReactUpdates = require('ReactUpdates');

if (__DEV__) {
  var warning = require('fbjs/lib/warning');
  var warnOnInvalidCallback = function warnOnInvalidCallback(callback, callerName) {
    warning(callback === null || typeof callback === 'function', '%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, '' + callback);
  };
}

function enqueueUpdate(internalInstance) {
  ReactUpdates.enqueueUpdate(internalInstance);
}

function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
  var internalInstance = ReactInstanceMap.get(publicInstance);
  if (!internalInstance) {
    if (__DEV__) {
      var ctor = publicInstance.constructor;
      warning(false, 'Can only update a mounted or mounting component. This usually means ' + 'you called setState, replaceState, or forceUpdate on an unmounted ' + 'component. This is a no-op.\n\nPlease check the code for the ' + '%s component.', ctor && (ctor.displayName || ctor.name) || 'ReactClass');
    }
    return null;
  }

  if (__DEV__) {
    warning(ReactCurrentOwner.current == null, 'Cannot update during an existing state transition (such as within ' + "`render` or another component's constructor). Render methods should " + 'be a pure function of props and state; constructor side-effects are ' + 'an anti-pattern, but can be moved to `componentWillMount`.');
  }

  return internalInstance;
}

var ReactUpdateQueue = {
  isMounted: function isMounted(publicInstance) {
    if (__DEV__) {
      var owner = ReactCurrentOwner.current;
      if (owner !== null) {
        warning(owner._warnedAboutRefsInRender, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component');
        owner._warnedAboutRefsInRender = true;
      }
    }
    var internalInstance = ReactInstanceMap.get(publicInstance);
    if (internalInstance) {
      return !!internalInstance._renderedComponent;
    } else {
      return false;
    }
  },

  enqueueCallbackInternal: function enqueueCallbackInternal(internalInstance, callback) {
    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }
    enqueueUpdate(internalInstance);
  },

  enqueueForceUpdate: function enqueueForceUpdate(publicInstance, callback, callerName) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    if (!internalInstance) {
      return;
    }

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, callerName);
      }
      if (internalInstance._pendingCallbacks) {
        internalInstance._pendingCallbacks.push(callback);
      } else {
        internalInstance._pendingCallbacks = [callback];
      }
    }

    internalInstance._pendingForceUpdate = true;

    enqueueUpdate(internalInstance);
  },

  enqueueReplaceState: function enqueueReplaceState(publicInstance, completeState, callback, callerName) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    if (!internalInstance) {
      return;
    }

    internalInstance._pendingStateQueue = [completeState];
    internalInstance._pendingReplaceState = true;

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, callerName);
      }
      if (internalInstance._pendingCallbacks) {
        internalInstance._pendingCallbacks.push(callback);
      } else {
        internalInstance._pendingCallbacks = [callback];
      }
    }

    enqueueUpdate(internalInstance);
  },

  enqueueSetState: function enqueueSetState(publicInstance, partialState, callback, callerName) {
    if (__DEV__) {
      ReactInstrumentation.debugTool.onSetState();
      warning(partialState != null, 'setState(...): You passed an undefined or null state object; ' + 'instead, use forceUpdate().');
    }

    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    if (!internalInstance) {
      return;
    }

    var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
    queue.push(partialState);

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, callerName);
      }
      if (internalInstance._pendingCallbacks) {
        internalInstance._pendingCallbacks.push(callback);
      } else {
        internalInstance._pendingCallbacks = [callback];
      }
    }

    enqueueUpdate(internalInstance);
  },

  enqueueElementInternal: function enqueueElementInternal(internalInstance, nextElement, nextContext) {
    internalInstance._pendingElement = nextElement;

    internalInstance._context = nextContext;
    enqueueUpdate(internalInstance);
  }
};

module.exports = ReactUpdateQueue;