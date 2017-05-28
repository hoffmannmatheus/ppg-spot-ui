
'use strict';

var ReactNative = require('ReactNative');
var ReactNativeFeatureFlags = require('ReactNativeFeatureFlags');
var ReactNativeAttributePayload = require('ReactNativeAttributePayload');
var TextInputState = require('TextInputState');
var UIManager = require('UIManager');

var invariant = require('fbjs/lib/invariant');
var findNodeHandle = require('findNodeHandle');

var _require = require('NativeMethodsMixinUtils'),
    mountSafeCallback = _require.mountSafeCallback,
    throwOnStylesProp = _require.throwOnStylesProp,
    warnForStyleProps = _require.warnForStyleProps;

var NativeMethodsMixin = {
  measure: function measure(callback) {
    UIManager.measure(ReactNative.findNodeHandle(this), mountSafeCallback(this, callback));
  },

  measureInWindow: function measureInWindow(callback) {
    UIManager.measureInWindow(ReactNative.findNodeHandle(this), mountSafeCallback(this, callback));
  },

  measureLayout: function measureLayout(relativeToNativeNode, onSuccess, onFail) {
    UIManager.measureLayout(ReactNative.findNodeHandle(this), relativeToNativeNode, mountSafeCallback(this, onFail), mountSafeCallback(this, onSuccess));
  },

  setNativeProps: function setNativeProps(nativeProps) {
    require('ReactNative');

    injectedSetNativeProps(this, nativeProps);
  },

  focus: function focus() {
    TextInputState.focusTextInput(ReactNative.findNodeHandle(this));
  },

  blur: function blur() {
    TextInputState.blurTextInput(ReactNative.findNodeHandle(this));
  }
};

function setNativePropsFiber(componentOrHandle, nativeProps) {
  var maybeInstance = void 0;

  try {
    maybeInstance = findNodeHandle(componentOrHandle);
  } catch (error) {}

  if (maybeInstance == null) {
    return;
  }

  var viewConfig = maybeInstance.viewConfig;

  if (__DEV__) {
    warnForStyleProps(nativeProps, viewConfig.validAttributes);
  }

  var updatePayload = ReactNativeAttributePayload.create(nativeProps, viewConfig.validAttributes);

  UIManager.updateView(maybeInstance._nativeTag, viewConfig.uiViewClassName, updatePayload);
}

function setNativePropsStack(componentOrHandle, nativeProps) {
  var maybeInstance = findNodeHandle(componentOrHandle);

  if (maybeInstance == null) {
    return;
  }

  var viewConfig = void 0;
  if (maybeInstance.viewConfig !== undefined) {
    viewConfig = maybeInstance.viewConfig;
  } else if (maybeInstance._instance !== undefined && maybeInstance._instance.viewConfig !== undefined) {
    viewConfig = maybeInstance._instance.viewConfig;
  } else {
    while (maybeInstance._renderedComponent !== undefined) {
      maybeInstance = maybeInstance._renderedComponent;
    }
    viewConfig = maybeInstance.viewConfig;
  }

  var tag = typeof maybeInstance.getHostNode === 'function' ? maybeInstance.getHostNode() : maybeInstance._rootNodeID;

  if (__DEV__) {
    warnForStyleProps(nativeProps, viewConfig.validAttributes);
  }

  var updatePayload = ReactNativeAttributePayload.create(nativeProps, viewConfig.validAttributes);

  UIManager.updateView(tag, viewConfig.uiViewClassName, updatePayload);
}

var injectedSetNativeProps = void 0;
if (ReactNativeFeatureFlags.useFiber) {
  injectedSetNativeProps = setNativePropsFiber;
} else {
  injectedSetNativeProps = setNativePropsStack;
}

if (__DEV__) {
  var NativeMethodsMixin_DEV = NativeMethodsMixin;
  invariant(!NativeMethodsMixin_DEV.componentWillMount && !NativeMethodsMixin_DEV.componentWillReceiveProps, 'Do not override existing functions.');
  NativeMethodsMixin_DEV.componentWillMount = function () {
    throwOnStylesProp(this, this.props);
  };
  NativeMethodsMixin_DEV.componentWillReceiveProps = function (newProps) {
    throwOnStylesProp(this, newProps);
  };
}

module.exports = NativeMethodsMixin;