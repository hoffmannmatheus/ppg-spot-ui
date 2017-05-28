

'use strict';

var ReactNativeAttributePayload = require('ReactNativeAttributePayload');
var TextInputState = require('TextInputState');
var UIManager = require('UIManager');

var _require = require('NativeMethodsMixinUtils'),
    mountSafeCallback = _require.mountSafeCallback,
    warnForStyleProps = _require.warnForStyleProps;

var ReactNativeFiberHostComponent = function () {
  function ReactNativeFiberHostComponent(tag, viewConfig) {
    babelHelpers.classCallCheck(this, ReactNativeFiberHostComponent);

    this._nativeTag = tag;
    this._children = [];
    this.viewConfig = viewConfig;
  }

  babelHelpers.createClass(ReactNativeFiberHostComponent, [{
    key: 'blur',
    value: function blur() {
      TextInputState.blurTextInput(this._nativeTag);
    }
  }, {
    key: 'focus',
    value: function focus() {
      TextInputState.focusTextInput(this._nativeTag);
    }
  }, {
    key: 'measure',
    value: function measure(callback) {
      UIManager.measure(this._nativeTag, mountSafeCallback(this, callback));
    }
  }, {
    key: 'measureInWindow',
    value: function measureInWindow(callback) {
      UIManager.measureInWindow(this._nativeTag, mountSafeCallback(this, callback));
    }
  }, {
    key: 'measureLayout',
    value: function measureLayout(relativeToNativeNode, onSuccess, onFail) {
      UIManager.measureLayout(this._nativeTag, relativeToNativeNode, mountSafeCallback(this, onFail), mountSafeCallback(this, onSuccess));
    }
  }, {
    key: 'setNativeProps',
    value: function setNativeProps(nativeProps) {
      if (__DEV__) {
        warnForStyleProps(nativeProps, this.viewConfig.validAttributes);
      }

      var updatePayload = ReactNativeAttributePayload.create(nativeProps, this.viewConfig.validAttributes);

      UIManager.updateView(this._nativeTag, this.viewConfig.uiViewClassName, updatePayload);
    }
  }]);
  return ReactNativeFiberHostComponent;
}();

module.exports = ReactNativeFiberHostComponent;