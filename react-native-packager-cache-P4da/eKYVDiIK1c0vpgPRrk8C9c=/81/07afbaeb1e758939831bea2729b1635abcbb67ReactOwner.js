

'use strict';

var _require = require('ReactTypeOfWork'),
    ClassComponent = _require.ClassComponent;

var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');

function isValidOwner(object) {
  return !!(object && typeof object.attachRef === 'function' && typeof object.detachRef === 'function');
}

var ReactOwner = {
  addComponentAsRefTo: function addComponentAsRefTo(component, ref, owner) {
    if (owner && owner.tag === ClassComponent) {
      var inst = owner.stateNode;
      var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
      refs[ref] = component.getPublicInstance();
    } else {
      invariant(isValidOwner(owner), 'addComponentAsRefTo(...): Only a ReactOwner can have refs. You might ' + "be adding a ref to a component that was not created inside a component's " + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).');
      owner.attachRef(ref, component);
    }
  },

  removeComponentAsRefFrom: function removeComponentAsRefFrom(component, ref, owner) {
    if (owner && owner.tag === ClassComponent) {
      var inst = owner.stateNode;
      if (inst && inst.refs[ref] === component.getPublicInstance()) {
        delete inst.refs[ref];
      }
    } else {
      invariant(isValidOwner(owner), 'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. You might ' + "be removing a ref to a component that was not created inside a component's " + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).');
      var ownerPublicInstance = owner.getPublicInstance();

      if (ownerPublicInstance && ownerPublicInstance.refs[ref] === component.getPublicInstance()) {
        owner.detachRef(ref);
      }
    }
  }
};

module.exports = ReactOwner;