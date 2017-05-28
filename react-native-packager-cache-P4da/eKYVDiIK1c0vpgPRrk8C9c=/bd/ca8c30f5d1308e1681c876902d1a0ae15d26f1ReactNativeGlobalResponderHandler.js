
'use strict';

var UIManager = require('UIManager');

var ReactNativeGlobalResponderHandler = {
  onChange: function onChange(from, to, blockNativeResponder) {
    if (to !== null) {
      var tag = typeof to.tag !== 'number' ? to._rootNodeID : to.stateNode._nativeTag;
      UIManager.setJSResponder(tag, blockNativeResponder);
    } else {
      UIManager.clearJSResponder();
    }
  }
};

module.exports = ReactNativeGlobalResponderHandler;