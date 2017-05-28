
'use strict';

var ReactNativeFeatureFlags = require('ReactNativeFeatureFlags');

module.exports = ReactNativeFeatureFlags.useFiber ? require('ReactNativeFiber') : require('ReactNativeStack');