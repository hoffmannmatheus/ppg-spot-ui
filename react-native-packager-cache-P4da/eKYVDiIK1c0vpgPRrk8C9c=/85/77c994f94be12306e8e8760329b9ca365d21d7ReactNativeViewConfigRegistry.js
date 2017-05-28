

'use strict';

var invariant = require('fbjs/lib/invariant');

var viewConfigs = new Map();

var prefix = 'topsecret-';

var ReactNativeViewConfigRegistry = {
  register: function register(viewConfig) {
    var name = viewConfig.uiViewClassName;
    invariant(!viewConfigs.has(name), 'Tried to register two views with the same name %s', name);
    var secretName = prefix + name;
    viewConfigs.set(secretName, viewConfig);
    return secretName;
  },
  get: function get(secretName) {
    var config = viewConfigs.get(secretName);
    invariant(config, 'View config not found for name %s', secretName);
    return config;
  }
};

module.exports = ReactNativeViewConfigRegistry;