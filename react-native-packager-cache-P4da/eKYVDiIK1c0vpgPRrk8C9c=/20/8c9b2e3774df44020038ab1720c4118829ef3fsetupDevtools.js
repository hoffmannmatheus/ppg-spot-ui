
'use strict';

if (__DEV__) {
  var AppState = require('AppState');

  var _require = require('NativeModules'),
      PlatformConstants = _require.PlatformConstants;

  var _require2 = require('react-devtools-core'),
      connectToDevTools = _require2.connectToDevTools;

  connectToDevTools({
    isAppActive: function isAppActive() {
      return AppState.currentState !== 'background';
    },

    host: PlatformConstants && PlatformConstants.ServerHost ? PlatformConstants.ServerHost.split(':')[0] : 'localhost',

    port: window.__REACT_DEVTOOLS_PORT__,
    resolveRNStyle: require('flattenStyle')
  });
}