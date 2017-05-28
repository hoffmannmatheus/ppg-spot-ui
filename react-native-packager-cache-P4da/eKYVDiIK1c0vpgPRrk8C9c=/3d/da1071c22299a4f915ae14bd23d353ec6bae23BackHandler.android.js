

'use strict';

var DeviceEventManager = require('NativeModules').DeviceEventManager;
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var DEVICE_BACK_EVENT = 'hardwareBackPress';

var _backPressSubscriptions = new Set();

RCTDeviceEventEmitter.addListener(DEVICE_BACK_EVENT, function () {
  var backPressSubscriptions = new Set(_backPressSubscriptions);
  var invokeDefault = true;
  var subscriptions = [].concat(babelHelpers.toConsumableArray(backPressSubscriptions)).reverse();
  for (var i = 0; i < subscriptions.length; ++i) {
    if (subscriptions[i]()) {
      invokeDefault = false;
      break;
    }
  }

  if (invokeDefault) {
    BackHandler.exitApp();
  }
});

var BackHandler = {

  exitApp: function exitApp() {
    DeviceEventManager.invokeDefaultBackPressHandler();
  },

  addEventListener: function addEventListener(eventName, handler) {
    _backPressSubscriptions.add(handler);
    return {
      remove: function remove() {
        return BackHandler.removeEventListener(eventName, handler);
      }
    };
  },

  removeEventListener: function removeEventListener(eventName, handler) {
    _backPressSubscriptions.delete(handler);
  }

};

module.exports = BackHandler;