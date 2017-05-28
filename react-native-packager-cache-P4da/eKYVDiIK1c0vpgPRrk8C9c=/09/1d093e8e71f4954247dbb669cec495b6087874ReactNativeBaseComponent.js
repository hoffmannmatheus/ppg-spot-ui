
'use strict';

var NativeMethodsMixin = require('NativeMethodsMixin');
var ReactNativeAttributePayload = require('ReactNativeAttributePayload');
var ReactNativeComponentTree = require('ReactNativeComponentTree');
var ReactNativeTagHandles = require('ReactNativeTagHandles');
var ReactMultiChild = require('ReactMultiChild');
var UIManager = require('UIManager');

var deepFreezeAndThrowOnMutationInDev = require('deepFreezeAndThrowOnMutationInDev');

var ReactNativeBaseComponent = function ReactNativeBaseComponent(viewConfig) {
  this.viewConfig = viewConfig;
};

ReactNativeBaseComponent.Mixin = {
  getPublicInstance: function getPublicInstance() {
    return this;
  },

  unmountComponent: function unmountComponent(safely, skipLifecycle) {
    ReactNativeComponentTree.uncacheNode(this);
    this.unmountChildren(safely, skipLifecycle);
    this._rootNodeID = 0;
  },

  initializeChildren: function initializeChildren(children, containerTag, transaction, context) {
    var mountImages = this.mountChildren(children, transaction, context);

    if (mountImages.length) {
      var createdTags = [];
      for (var i = 0, l = mountImages.length; i < l; i++) {
        var mountImage = mountImages[i];
        var childTag = mountImage;
        createdTags[i] = childTag;
      }
      UIManager.setChildren(containerTag, createdTags);
    }
  },

  receiveComponent: function receiveComponent(nextElement, transaction, context) {
    var prevElement = this._currentElement;
    this._currentElement = nextElement;

    if (__DEV__) {
      for (var key in this.viewConfig.validAttributes) {
        if (nextElement.props.hasOwnProperty(key)) {
          deepFreezeAndThrowOnMutationInDev(nextElement.props[key]);
        }
      }
    }

    var updatePayload = ReactNativeAttributePayload.diff(prevElement.props, nextElement.props, this.viewConfig.validAttributes);

    if (updatePayload) {
      UIManager.updateView(this._rootNodeID, this.viewConfig.uiViewClassName, updatePayload);
    }

    this.updateChildren(nextElement.props.children, transaction, context);
  },

  getHostNode: function getHostNode() {
    return this._rootNodeID;
  },

  mountComponent: function mountComponent(transaction, hostParent, hostContainerInfo, context) {
    var tag = ReactNativeTagHandles.allocateTag();

    this._rootNodeID = tag;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    if (__DEV__) {
      for (var key in this.viewConfig.validAttributes) {
        if (this._currentElement.props.hasOwnProperty(key)) {
          deepFreezeAndThrowOnMutationInDev(this._currentElement.props[key]);
        }
      }
    }

    var updatePayload = ReactNativeAttributePayload.create(this._currentElement.props, this.viewConfig.validAttributes);

    var nativeTopRootTag = hostContainerInfo._tag;
    UIManager.createView(tag, this.viewConfig.uiViewClassName, nativeTopRootTag, updatePayload);

    ReactNativeComponentTree.precacheNode(this, tag);

    this.initializeChildren(this._currentElement.props.children, tag, transaction, context);
    return tag;
  }
};

babelHelpers.extends(ReactNativeBaseComponent.prototype, ReactMultiChild, ReactNativeBaseComponent.Mixin, NativeMethodsMixin);

module.exports = ReactNativeBaseComponent;