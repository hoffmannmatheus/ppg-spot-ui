

'use strict';

var ReactTypeOfWork = require('ReactTypeOfWork');
var IndeterminateComponent = ReactTypeOfWork.IndeterminateComponent,
    ClassComponent = ReactTypeOfWork.ClassComponent,
    HostRoot = ReactTypeOfWork.HostRoot,
    HostComponent = ReactTypeOfWork.HostComponent,
    HostText = ReactTypeOfWork.HostText,
    HostPortal = ReactTypeOfWork.HostPortal,
    CoroutineComponent = ReactTypeOfWork.CoroutineComponent,
    YieldComponent = ReactTypeOfWork.YieldComponent,
    Fragment = ReactTypeOfWork.Fragment;

var _require = require('ReactPriorityLevel'),
    NoWork = _require.NoWork;

var _require2 = require('ReactTypeOfSideEffect'),
    NoEffect = _require2.NoEffect;

var _require3 = require('ReactFiberUpdateQueue'),
    cloneUpdateQueue = _require3.cloneUpdateQueue;

var invariant = require('fbjs/lib/invariant');

if (__DEV__) {
  var getComponentName = require('getComponentName');
}

if (__DEV__) {
  var debugCounter = 1;
}

var createFiber = function createFiber(tag, key) {
  var fiber = {

    tag: tag,

    key: key,

    type: null,

    stateNode: null,

    return: null,

    child: null,
    sibling: null,
    index: 0,

    ref: null,

    pendingProps: null,
    memoizedProps: null,
    updateQueue: null,
    memoizedState: null,

    effectTag: NoEffect,
    nextEffect: null,
    firstEffect: null,
    lastEffect: null,

    pendingWorkPriority: NoWork,
    progressedPriority: NoWork,
    progressedChild: null,
    progressedFirstDeletion: null,
    progressedLastDeletion: null,

    alternate: null
  };

  if (__DEV__) {
    fiber._debugID = debugCounter++;
    fiber._debugSource = null;
    fiber._debugOwner = null;
    fiber._debugIsCurrentlyTiming = false;
    if (typeof Object.preventExtensions === 'function') {
      Object.preventExtensions(fiber);
    }
  }

  return fiber;
};

function shouldConstruct(Component) {
  return !!(Component.prototype && Component.prototype.isReactComponent);
}

exports.cloneFiber = function (fiber, priorityLevel) {
  var alt = fiber.alternate;
  if (alt !== null) {
    alt.effectTag = NoEffect;
    alt.nextEffect = null;
    alt.firstEffect = null;
    alt.lastEffect = null;
  } else {
    alt = createFiber(fiber.tag, fiber.key);
    alt.type = fiber.type;

    alt.progressedChild = fiber.progressedChild;
    alt.progressedPriority = fiber.progressedPriority;

    alt.alternate = fiber;
    fiber.alternate = alt;
  }

  alt.stateNode = fiber.stateNode;
  alt.child = fiber.child;
  alt.sibling = fiber.sibling;
  alt.index = fiber.index;
  alt.ref = fiber.ref;

  alt.pendingProps = fiber.pendingProps;
  cloneUpdateQueue(fiber, alt);
  alt.pendingWorkPriority = priorityLevel;

  alt.memoizedProps = fiber.memoizedProps;
  alt.memoizedState = fiber.memoizedState;

  if (__DEV__) {
    alt._debugID = fiber._debugID;
    alt._debugSource = fiber._debugSource;
    alt._debugOwner = fiber._debugOwner;
  }

  return alt;
};

exports.createHostRootFiber = function () {
  var fiber = createFiber(HostRoot, null);
  return fiber;
};

exports.createFiberFromElement = function (element, priorityLevel) {
  var owner = null;
  if (__DEV__) {
    owner = element._owner;
  }

  var fiber = createFiberFromElementType(element.type, element.key, owner);
  fiber.pendingProps = element.props;
  fiber.pendingWorkPriority = priorityLevel;

  if (__DEV__) {
    fiber._debugSource = element._source;
    fiber._debugOwner = element._owner;
  }

  return fiber;
};

exports.createFiberFromFragment = function (elements, priorityLevel) {
  var fiber = createFiber(Fragment, null);
  fiber.pendingProps = elements;
  fiber.pendingWorkPriority = priorityLevel;
  return fiber;
};

exports.createFiberFromText = function (content, priorityLevel) {
  var fiber = createFiber(HostText, null);
  fiber.pendingProps = content;
  fiber.pendingWorkPriority = priorityLevel;
  return fiber;
};

function createFiberFromElementType(type, key, debugOwner) {
  var fiber = void 0;
  if (typeof type === 'function') {
    fiber = shouldConstruct(type) ? createFiber(ClassComponent, key) : createFiber(IndeterminateComponent, key);
    fiber.type = type;
  } else if (typeof type === 'string') {
    fiber = createFiber(HostComponent, key);
    fiber.type = type;
  } else if (typeof type === 'object' && type !== null && typeof type.tag === 'number') {
    fiber = type;
  } else {
    var info = '';
    if (__DEV__) {
      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in.";
      }
      var ownerName = debugOwner ? getComponentName(debugOwner) : null;
      if (ownerName) {
        info += '\n\nCheck the render method of `' + ownerName + '`.';
      }
    }
    invariant(false, 'Element type is invalid: expected a string (for built-in components) ' + 'or a class/function (for composite components) but got: %s.%s', type == null ? type : typeof type, info);
  }
  return fiber;
}

exports.createFiberFromElementType = createFiberFromElementType;

exports.createFiberFromCoroutine = function (coroutine, priorityLevel) {
  var fiber = createFiber(CoroutineComponent, coroutine.key);
  fiber.type = coroutine.handler;
  fiber.pendingProps = coroutine;
  fiber.pendingWorkPriority = priorityLevel;
  return fiber;
};

exports.createFiberFromYield = function (yieldNode, priorityLevel) {
  var fiber = createFiber(YieldComponent, null);
  return fiber;
};

exports.createFiberFromPortal = function (portal, priorityLevel) {
  var fiber = createFiber(HostPortal, portal.key);
  fiber.pendingProps = portal.children || [];
  fiber.pendingWorkPriority = priorityLevel;
  fiber.stateNode = {
    containerInfo: portal.containerInfo,
    implementation: portal.implementation
  };
  return fiber;
};