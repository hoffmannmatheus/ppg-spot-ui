
'use strict';

require('InitializeCore');

var EventPluginHub = require('EventPluginHub');
var EventPluginUtils = require('EventPluginUtils');
var RCTEventEmitter = require('RCTEventEmitter');
var ReactNativeBridgeEventPlugin = require('ReactNativeBridgeEventPlugin');
var ReactNativeComponentTree = require('ReactNativeComponentTree');
var ReactNativeEventEmitter = require('ReactNativeEventEmitter');
var ReactNativeEventPluginOrder = require('ReactNativeEventPluginOrder');
var ReactNativeGlobalResponderHandler = require('ReactNativeGlobalResponderHandler');
var ResponderEventPlugin = require('ResponderEventPlugin');

function inject() {
  RCTEventEmitter.register(ReactNativeEventEmitter);

  EventPluginHub.injection.injectEventPluginOrder(ReactNativeEventPluginOrder);
  EventPluginUtils.injection.injectComponentTree(ReactNativeComponentTree);

  ResponderEventPlugin.injection.injectGlobalResponderHandler(ReactNativeGlobalResponderHandler);

  EventPluginHub.injection.injectEventPluginsByName({
    ResponderEventPlugin: ResponderEventPlugin,
    ReactNativeBridgeEventPlugin: ReactNativeBridgeEventPlugin
  });
}

module.exports = {
  inject: inject
};