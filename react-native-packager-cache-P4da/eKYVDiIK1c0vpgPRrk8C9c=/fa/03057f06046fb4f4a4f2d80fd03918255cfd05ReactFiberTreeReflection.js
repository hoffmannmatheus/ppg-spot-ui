

'use strict';

var ReactInstanceMap = require('ReactInstanceMap');
var ReactCurrentOwner = require('react/lib/ReactCurrentOwner');

var getComponentName = require('getComponentName');
var invariant = require('fbjs/lib/invariant');

if (__DEV__) {
  var warning = require('fbjs/lib/warning');
}

var _require = require('ReactTypeOfWork'),
    HostRoot = _require.HostRoot,
    HostComponent = _require.HostComponent,
    HostText = _require.HostText,
    ClassComponent = _require.ClassComponent;

var _require2 = require('ReactTypeOfSideEffect'),
    NoEffect = _require2.NoEffect,
    Placement = _require2.Placement;

var MOUNTING = 1;
var MOUNTED = 2;
var UNMOUNTED = 3;

function isFiberMountedImpl(fiber) {
  var node = fiber;
  if (!fiber.alternate) {
    if ((node.effectTag & Placement) !== NoEffect) {
      return MOUNTING;
    }
    while (node.return) {
      node = node.return;
      if ((node.effectTag & Placement) !== NoEffect) {
        return MOUNTING;
      }
    }
  } else {
    while (node.return) {
      node = node.return;
    }
  }
  if (node.tag === HostRoot) {
    return MOUNTED;
  }

  return UNMOUNTED;
}
exports.isFiberMounted = function (fiber) {
  return isFiberMountedImpl(fiber) === MOUNTED;
};

exports.isMounted = function (component) {
  if (__DEV__) {
    var owner = ReactCurrentOwner.current;
    if (owner !== null && owner.tag === ClassComponent) {
      var ownerFiber = owner;
      var instance = ownerFiber.stateNode;
      warning(instance._warnedAboutRefsInRender, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(ownerFiber) || 'A component');
      instance._warnedAboutRefsInRender = true;
    }
  }

  var fiber = ReactInstanceMap.get(component);
  if (!fiber) {
    return false;
  }
  return isFiberMountedImpl(fiber) === MOUNTED;
};

function assertIsMounted(fiber) {
  invariant(isFiberMountedImpl(fiber) === MOUNTED, 'Unable to find node on an unmounted component.');
}

function findCurrentFiberUsingSlowPath(fiber) {
  var alternate = fiber.alternate;
  if (!alternate) {
    var state = isFiberMountedImpl(fiber);
    invariant(state !== UNMOUNTED, 'Unable to find node on an unmounted component.');
    if (state === MOUNTING) {
      return null;
    }
    return fiber;
  }

  var a = fiber;
  var b = alternate;
  while (true) {
    var parentA = a.return;
    var parentB = parentA ? parentA.alternate : null;
    if (!parentA || !parentB) {
      break;
    }

    if (parentA.child === parentB.child) {
      var child = parentA.child;
      while (child) {
        if (child === a) {
          assertIsMounted(parentA);
          return fiber;
        }
        if (child === b) {
          assertIsMounted(parentA);
          return alternate;
        }
        child = child.sibling;
      }

      invariant(false, 'Unable to find node on an unmounted component.');
    }

    if (a.return !== b.return) {
      a = parentA;
      b = parentB;
    } else {
      var didFindChild = false;
      var _child = parentA.child;
      while (_child) {
        if (_child === a) {
          didFindChild = true;
          a = parentA;
          b = parentB;
          break;
        }
        if (_child === b) {
          didFindChild = true;
          b = parentA;
          a = parentB;
          break;
        }
        _child = _child.sibling;
      }
      if (!didFindChild) {
        _child = parentB.child;
        while (_child) {
          if (_child === a) {
            didFindChild = true;
            a = parentB;
            b = parentA;
            break;
          }
          if (_child === b) {
            didFindChild = true;
            b = parentB;
            a = parentA;
            break;
          }
          _child = _child.sibling;
        }
        invariant(didFindChild, 'Child was not found in either parent set. This indicates a bug ' + 'related to the return pointer.');
      }
    }

    invariant(a.alternate === b, "Return fibers should always be each others' alternates.");
  }

  invariant(a.tag === HostRoot, 'Unable to find node on an unmounted component.');
  if (a.stateNode.current === a) {
    return fiber;
  }

  return alternate;
}
exports.findCurrentFiberUsingSlowPath = findCurrentFiberUsingSlowPath;

exports.findCurrentHostFiber = function (parent) {
  var currentParent = findCurrentFiberUsingSlowPath(parent);
  if (!currentParent) {
    return null;
  }

  var node = currentParent;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      return node;
    } else if (node.child) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === currentParent) {
      return null;
    }
    while (!node.sibling) {
      if (!node.return || node.return === currentParent) {
        return null;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }

  return null;
};