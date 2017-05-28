

'use strict';

var warning = require('fbjs/lib/warning');

var rendererID = null;
var injectInternals = null;
var onCommitRoot = null;
var onCommitUnmount = null;
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' && __REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber) {
  var inject = __REACT_DEVTOOLS_GLOBAL_HOOK__.inject,
      onCommitFiberRoot = __REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot,
      onCommitFiberUnmount = __REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount;


  injectInternals = function injectInternals(internals) {
    warning(rendererID == null, 'Cannot inject into DevTools twice.');
    rendererID = inject(internals);
  };

  onCommitRoot = function onCommitRoot(root) {
    if (rendererID == null) {
      return;
    }
    try {
      onCommitFiberRoot(rendererID, root);
    } catch (err) {
      if (__DEV__) {
        warning(false, 'React DevTools encountered an error: %s', err);
      }
    }
  };

  onCommitUnmount = function onCommitUnmount(fiber) {
    if (rendererID == null) {
      return;
    }
    try {
      onCommitFiberUnmount(rendererID, fiber);
    } catch (err) {
      if (__DEV__) {
        warning(false, 'React DevTools encountered an error: %s', err);
      }
    }
  };
}

exports.injectInternals = injectInternals;
exports.onCommitRoot = onCommitRoot;
exports.onCommitUnmount = onCommitUnmount;