
'use strict';

var ReactNativeComponentTree = require('ReactNativeComponentTree');
var ReactNativeInjection = require('ReactNativeInjection');
var ReactNativeMount = require('ReactNativeMount');
var ReactNativeStackInjection = require('ReactNativeStackInjection');
var ReactUpdates = require('ReactUpdates');

var _findNodeHandle = require('findNodeHandle');
var takeSnapshot = require('takeSnapshot');

ReactNativeInjection.inject();
ReactNativeStackInjection.inject();

var render = function render(element, mountInto, callback) {
  return ReactNativeMount.renderComponent(element, mountInto, callback);
};

var ReactNative = {
  hasReactNativeInitialized: false,

  findNodeHandle: function findNodeHandle(componentOrHandle) {
    var nodeHandle = _findNodeHandle(componentOrHandle);
    if (nodeHandle == null || typeof nodeHandle === 'number') {
      return nodeHandle;
    }
    return nodeHandle.getHostNode();
  },


  render: render,

  takeSnapshot: takeSnapshot,

  unmountComponentAtNode: ReactNativeMount.unmountComponentAtNode,

  unstable_batchedUpdates: ReactUpdates.batchedUpdates,


  unmountComponentAtNodeAndRemoveContainer: ReactNativeMount.unmountComponentAtNodeAndRemoveContainer
};

if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function') {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
    ComponentTree: {
      getClosestInstanceFromNode: function getClosestInstanceFromNode(node) {
        return ReactNativeComponentTree.getClosestInstanceFromNode(node);
      },
      getNodeFromInstance: function getNodeFromInstance(inst) {
        while (inst._renderedComponent) {
          inst = inst._renderedComponent;
        }
        if (inst) {
          return ReactNativeComponentTree.getNodeFromInstance(inst);
        } else {
          return null;
        }
      }
    },
    Mount: ReactNativeMount,
    Reconciler: require('ReactReconciler')
  });
}

module.exports = ReactNative;