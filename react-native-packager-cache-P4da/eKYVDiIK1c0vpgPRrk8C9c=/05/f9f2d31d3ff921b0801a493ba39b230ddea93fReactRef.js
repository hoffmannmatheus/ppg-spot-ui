

'use strict';

var ReactOwner = require('ReactOwner');

var ReactRef = {};

if (__DEV__) {
  var ReactCompositeComponentTypes = require('ReactCompositeComponentTypes');
  var ReactComponentTreeHook = require('react/lib/ReactComponentTreeHook');
  var warning = require('fbjs/lib/warning');

  var warnedAboutStatelessRefs = {};
}

function attachRef(ref, component, owner) {
  if (__DEV__) {
    if (component._compositeType === ReactCompositeComponentTypes.StatelessFunctional) {
      var info = '';
      var ownerName = void 0;
      if (owner) {
        if (typeof owner.getName === 'function') {
          ownerName = owner.getName();
        }
        if (ownerName) {
          info += '\n\nCheck the render method of `' + ownerName + '`.';
        }
      }

      var warningKey = ownerName || component._debugID;
      var element = component._currentElement;
      if (element && element._source) {
        warningKey = element._source.fileName + ':' + element._source.lineNumber;
      }
      if (!warnedAboutStatelessRefs[warningKey]) {
        warnedAboutStatelessRefs[warningKey] = true;
        warning(false, 'Stateless function components cannot be given refs. ' + 'Attempts to access this ref will fail.%s%s', info, ReactComponentTreeHook.getStackAddendumByID(component._debugID));
      }
    }
  }

  if (typeof ref === 'function') {
    ref(component.getPublicInstance());
  } else {
    ReactOwner.addComponentAsRefTo(component, ref, owner);
  }
}

function detachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(null);
  } else {
    ReactOwner.removeComponentAsRefFrom(component, ref, owner);
  }
}

ReactRef.attachRefs = function (instance, element) {
  if (element === null || typeof element !== 'object') {
    return;
  }
  var ref = element.ref;
  if (ref != null) {
    attachRef(ref, instance, element._owner);
  }
};

ReactRef.shouldUpdateRefs = function (prevElement, nextElement) {

  var prevRef = null;
  var prevOwner = null;
  if (prevElement !== null && typeof prevElement === 'object') {
    prevRef = prevElement.ref;
    prevOwner = prevElement._owner;
  }

  var nextRef = null;
  var nextOwner = null;
  if (nextElement !== null && typeof nextElement === 'object') {
    nextRef = nextElement.ref;
    nextOwner = nextElement._owner;
  }

  return prevRef !== nextRef || typeof nextRef === 'string' && nextOwner !== prevOwner;
};

ReactRef.detachRefs = function (instance, element) {
  if (element === null || typeof element !== 'object') {
    return;
  }
  var ref = element.ref;
  if (ref != null) {
    detachRef(ref, instance, element._owner);
  }
};

module.exports = ReactRef;