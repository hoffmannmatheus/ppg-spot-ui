

'use strict';

var ReactNativeBaseComponent = require('ReactNativeBaseComponent');
var ReactNativeFeatureFlags = require('ReactNativeFeatureFlags');
var ReactNativeViewConfigRegistry = require('ReactNativeViewConfigRegistry');

var createReactNativeFiberComponentClass = function createReactNativeFiberComponentClass(viewConfig) {
  return ReactNativeViewConfigRegistry.register(viewConfig);
};

var createReactNativeComponentClass = function createReactNativeComponentClass(viewConfig) {
  var Constructor = function Constructor(element) {
    this._currentElement = element;
    this._topLevelWrapper = null;
    this._hostParent = null;
    this._hostContainerInfo = null;
    this._rootNodeID = 0;
    this._renderedChildren = null;
  };
  Constructor.displayName = viewConfig.uiViewClassName;
  Constructor.viewConfig = viewConfig;
  Constructor.propTypes = viewConfig.propTypes;
  Constructor.prototype = new ReactNativeBaseComponent(viewConfig);
  Constructor.prototype.constructor = Constructor;

  return Constructor;
};

module.exports = ReactNativeFeatureFlags.useFiber ? createReactNativeFiberComponentClass : createReactNativeComponentClass;