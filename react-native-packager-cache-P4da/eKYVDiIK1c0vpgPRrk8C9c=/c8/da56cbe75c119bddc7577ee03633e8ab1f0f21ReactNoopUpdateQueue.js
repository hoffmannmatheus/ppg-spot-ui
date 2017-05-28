

'use strict';

var warning = require('fbjs/lib/warning');

function warnNoop(publicInstance, callerName) {
  if (process.env.NODE_ENV !== 'production') {
    var constructor = publicInstance.constructor;
    process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, callerName, constructor && (constructor.displayName || constructor.name) || 'ReactClass') : void 0;
  }
}

var ReactNoopUpdateQueue = {
  isMounted: function isMounted(publicInstance) {
    return false;
  },

  enqueueForceUpdate: function enqueueForceUpdate(publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },

  enqueueReplaceState: function enqueueReplaceState(publicInstance, completeState, callback, callerName) {
    warnNoop(publicInstance, 'replaceState');
  },

  enqueueSetState: function enqueueSetState(publicInstance, partialState, callback, callerName) {
    warnNoop(publicInstance, 'setState');
  }
};

module.exports = ReactNoopUpdateQueue;