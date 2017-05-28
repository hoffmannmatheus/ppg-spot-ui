

'use strict';

var ReactFiberErrorLogger = require('ReactFiberErrorLogger');
var ReactFiberReconciler = require('ReactFiberReconciler');
var ReactGenericBatching = require('ReactGenericBatching');
var ReactNativeAttributePayload = require('ReactNativeAttributePayload');
var ReactNativeComponentTree = require('ReactNativeComponentTree');
var ReactNativeFiberErrorDialog = require('ReactNativeFiberErrorDialog');
var ReactNativeFiberHostComponent = require('ReactNativeFiberHostComponent');
var ReactNativeInjection = require('ReactNativeInjection');
var ReactNativeTagHandles = require('ReactNativeTagHandles');
var ReactNativeViewConfigRegistry = require('ReactNativeViewConfigRegistry');
var ReactPortal = require('ReactPortal');
var UIManager = require('UIManager');

var deepFreezeAndThrowOnMutationInDev = require('deepFreezeAndThrowOnMutationInDev');
var emptyObject = require('fbjs/lib/emptyObject');
var _findNodeHandle = require('findNodeHandle');
var invariant = require('fbjs/lib/invariant');
var takeSnapshot = require('takeSnapshot');

var _require = require('ReactFiberDevToolsHook'),
    injectInternals = _require.injectInternals;

var precacheFiberNode = ReactNativeComponentTree.precacheFiberNode,
    uncacheFiberNode = ReactNativeComponentTree.uncacheFiberNode,
    updateFiberProps = ReactNativeComponentTree.updateFiberProps;


ReactNativeInjection.inject();

function recursivelyUncacheFiberNode(node) {
  if (typeof node === 'number') {
    uncacheFiberNode(node);
  } else {
    uncacheFiberNode(node._nativeTag);

    node._children.forEach(recursivelyUncacheFiberNode);
  }
}

var NativeRenderer = ReactFiberReconciler({
  appendChild: function appendChild(parentInstance, child) {
    if (typeof parentInstance === 'number') {
      UIManager.setChildren(parentInstance, [child._nativeTag]);
    } else {
      var children = parentInstance._children;

      children.push(child);

      UIManager.manageChildren(parentInstance._nativeTag, [], [], [child._nativeTag], [children.length - 1], []);
    }
  },
  appendInitialChild: function appendInitialChild(parentInstance, child) {
    parentInstance._children.push(child);
  },
  commitTextUpdate: function commitTextUpdate(textInstance, oldText, newText) {
    UIManager.updateView(textInstance, 'RCTRawText', { text: newText });
  },
  commitMount: function commitMount(instance, type, newProps, internalInstanceHandle) {},
  commitUpdate: function commitUpdate(instance, updatePayloadTODO, type, oldProps, newProps, internalInstanceHandle) {
    var viewConfig = instance.viewConfig;

    updateFiberProps(instance._nativeTag, newProps);

    var updatePayload = ReactNativeAttributePayload.diff(oldProps, newProps, viewConfig.validAttributes);

    UIManager.updateView(instance._nativeTag, viewConfig.uiViewClassName, updatePayload);
  },
  createInstance: function createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
    var tag = ReactNativeTagHandles.allocateTag();
    var viewConfig = ReactNativeViewConfigRegistry.get(type);

    if (__DEV__) {
      for (var key in viewConfig.validAttributes) {
        if (props.hasOwnProperty(key)) {
          deepFreezeAndThrowOnMutationInDev(props[key]);
        }
      }
    }

    var updatePayload = ReactNativeAttributePayload.create(props, viewConfig.validAttributes);

    UIManager.createView(tag, viewConfig.uiViewClassName, rootContainerInstance, updatePayload);

    var component = new ReactNativeFiberHostComponent(tag, viewConfig);

    precacheFiberNode(internalInstanceHandle, tag);
    updateFiberProps(tag, props);

    return component;
  },
  createTextInstance: function createTextInstance(text, rootContainerInstance, hostContext, internalInstanceHandle) {
    var tag = ReactNativeTagHandles.allocateTag();

    UIManager.createView(tag, 'RCTRawText', rootContainerInstance, { text: text });

    precacheFiberNode(internalInstanceHandle, tag);

    return tag;
  },
  finalizeInitialChildren: function finalizeInitialChildren(parentInstance, type, props, rootContainerInstance) {
    if (parentInstance._children.length === 0) {
      return false;
    }

    var nativeTags = parentInstance._children.map(function (child) {
      return typeof child === 'number' ? child : child._nativeTag;
    });

    UIManager.setChildren(parentInstance._nativeTag, nativeTags);

    return false;
  },
  getRootHostContext: function getRootHostContext() {
    return emptyObject;
  },
  getChildHostContext: function getChildHostContext() {
    return emptyObject;
  },
  getPublicInstance: function getPublicInstance(instance) {
    return instance;
  },
  insertBefore: function insertBefore(parentInstance, child, beforeChild) {
    invariant(typeof parentInstance !== 'number', 'Container does not support insertBefore operation');

    var children = parentInstance._children;

    var beforeChildIndex = children.indexOf(beforeChild);
    var index = children.indexOf(child);

    if (index >= 0) {
      children.splice(index, 1);
      children.splice(beforeChildIndex, 0, child);

      UIManager.manageChildren(parentInstance._nativeTag, [index], [beforeChildIndex], [], [], []);
    } else {
      children.splice(beforeChildIndex, 0, child);

      UIManager.manageChildren(parentInstance._nativeTag, [], [], [child._nativeTag], [beforeChildIndex], []);
    }
  },
  prepareForCommit: function prepareForCommit() {},
  prepareUpdate: function prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
    return emptyObject;
  },
  removeChild: function removeChild(parentInstance, child) {
    recursivelyUncacheFiberNode(child);

    if (typeof parentInstance === 'number') {
      UIManager.manageChildren(parentInstance, [], [], [], [], [0]);
    } else {
      var children = parentInstance._children;
      var index = children.indexOf(child);

      children.splice(index, 1);

      UIManager.manageChildren(parentInstance._nativeTag, [], [], [], [], [index]);
    }
  },
  resetAfterCommit: function resetAfterCommit() {},
  resetTextContent: function resetTextContent(instance) {},
  shouldDeprioritizeSubtree: function shouldDeprioritizeSubtree(type, props) {
    return false;
  },


  scheduleAnimationCallback: global.requestAnimationFrame,

  scheduleDeferredCallback: global.requestIdleCallback,

  shouldSetTextContent: function shouldSetTextContent(props) {
    return false;
  },


  useSyncScheduling: true
});

ReactGenericBatching.injection.injectFiberBatchedUpdates(NativeRenderer.batchedUpdates);

var roots = new Map();

_findNodeHandle.injection.injectFindNode(function (fiber) {
  return NativeRenderer.findHostInstance(fiber);
});
_findNodeHandle.injection.injectFindRootNodeID(function (instance) {
  return instance;
});

ReactFiberErrorLogger.injection.injectDialog(ReactNativeFiberErrorDialog.showDialog);

var ReactNative = {
  findNodeHandle: function findNodeHandle(componentOrHandle) {
    var instance = _findNodeHandle(componentOrHandle);
    if (instance == null || typeof instance === 'number') {
      return instance;
    }
    return instance._nativeTag;
  },
  render: function render(element, containerTag, callback) {
    var root = roots.get(containerTag);

    if (!root) {
      root = NativeRenderer.createContainer(containerTag);
      roots.set(containerTag, root);
    }
    NativeRenderer.updateContainer(element, root, null, callback);

    return NativeRenderer.getPublicRootInstance(root);
  },


  takeSnapshot: takeSnapshot,

  unmountComponentAtNode: function unmountComponentAtNode(containerTag) {
    var root = roots.get(containerTag);
    if (root) {
      NativeRenderer.updateContainer(null, root, null, function () {
        roots.delete(containerTag);
      });
    }
  },
  unmountComponentAtNodeAndRemoveContainer: function unmountComponentAtNodeAndRemoveContainer(containerTag) {
    ReactNative.unmountComponentAtNode(containerTag);

    UIManager.removeRootView(containerTag);
  },
  unstable_createPortal: function unstable_createPortal(children, containerTag) {
    var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return ReactPortal.createPortal(children, containerTag, null, key);
  },


  unstable_batchedUpdates: ReactGenericBatching.batchedUpdates
};

if (typeof injectInternals === 'function') {
  injectInternals({
    findFiberByHostInstance: ReactNativeComponentTree.getClosestInstanceFromNode,
    findHostInstanceByFiber: NativeRenderer.findHostInstance
  });
}

module.exports = ReactNative;