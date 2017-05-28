
'use strict';

require('InitializeCore');

var React = require('react');
var ReactComponentEnvironment = require('ReactComponentEnvironment');
var ReactDefaultBatchingStrategy = require('ReactDefaultBatchingStrategy');
var ReactEmptyComponent = require('ReactEmptyComponent');
var ReactGenericBatching = require('ReactGenericBatching');
var ReactHostComponent = require('ReactHostComponent');
var ReactNativeComponentEnvironment = require('ReactNativeComponentEnvironment');
var ReactNativeTextComponent = require('ReactNativeTextComponent');
var ReactSimpleEmptyComponent = require('ReactSimpleEmptyComponent');
var ReactUpdates = require('ReactUpdates');

var findNodeHandle = require('findNodeHandle');
var invariant = require('fbjs/lib/invariant');

function inject() {
  ReactGenericBatching.injection.injectStackBatchedUpdates(ReactUpdates.batchedUpdates);

  ReactUpdates.injection.injectReconcileTransaction(ReactNativeComponentEnvironment.ReactReconcileTransaction);

  ReactUpdates.injection.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactComponentEnvironment.injection.injectEnvironment(ReactNativeComponentEnvironment);

  var EmptyComponent = function EmptyComponent(instantiate) {
    var View = require('View');
    return new ReactSimpleEmptyComponent(React.createElement(View, {
      collapsable: true,
      style: { position: 'absolute' }
    }), instantiate);
  };

  findNodeHandle.injection.injectFindNode(function (instance) {
    return instance;
  });
  findNodeHandle.injection.injectFindRootNodeID(function (instance) {
    return instance;
  });

  ReactEmptyComponent.injection.injectEmptyComponentFactory(EmptyComponent);

  ReactHostComponent.injection.injectTextComponentClass(ReactNativeTextComponent);
  ReactHostComponent.injection.injectGenericComponentClass(function (tag) {
    var info = '';
    if (typeof tag === 'string' && /^[a-z]/.test(tag)) {
      info += ' Each component name should start with an uppercase letter.';
    }
    invariant(false, 'Expected a component class, got %s.%s', tag, info);
  });
}

module.exports = {
  inject: inject
};