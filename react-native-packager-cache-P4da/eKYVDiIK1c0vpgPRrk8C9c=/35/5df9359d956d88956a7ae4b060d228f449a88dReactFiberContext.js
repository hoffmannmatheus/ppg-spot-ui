

'use strict';

var emptyObject = require('fbjs/lib/emptyObject');
var getComponentName = require('getComponentName');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var _require = require('ReactFiberTreeReflection'),
    isFiberMounted = _require.isFiberMounted;

var _require2 = require('ReactTypeOfWork'),
    ClassComponent = _require2.ClassComponent,
    HostRoot = _require2.HostRoot;

var _require3 = require('ReactFiberStack'),
    createCursor = _require3.createCursor,
    pop = _require3.pop,
    push = _require3.push;

if (__DEV__) {
  var checkReactTypeSpec = require('checkReactTypeSpec');
  var ReactDebugCurrentFrame = require('react/lib/ReactDebugCurrentFrame');
  var ReactDebugCurrentFiber = require('ReactDebugCurrentFiber');

  var _require4 = require('ReactDebugFiberPerf'),
      startPhaseTimer = _require4.startPhaseTimer,
      stopPhaseTimer = _require4.stopPhaseTimer;

  var warnedAboutMissingGetChildContext = {};
}

var contextStackCursor = createCursor(emptyObject);

var didPerformWorkStackCursor = createCursor(false);

var previousContext = emptyObject;

function getUnmaskedContext(workInProgress) {
  var hasOwnContext = isContextProvider(workInProgress);
  if (hasOwnContext) {
    return previousContext;
  }
  return contextStackCursor.current;
}
exports.getUnmaskedContext = getUnmaskedContext;

function cacheContext(workInProgress, unmaskedContext, maskedContext) {
  var instance = workInProgress.stateNode;
  instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
  instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
}
exports.cacheContext = cacheContext;

exports.getMaskedContext = function (workInProgress, unmaskedContext) {
  var type = workInProgress.type;
  var contextTypes = type.contextTypes;
  if (!contextTypes) {
    return emptyObject;
  }

  var instance = workInProgress.stateNode;
  if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) {
    return instance.__reactInternalMemoizedMaskedChildContext;
  }

  var context = {};
  for (var key in contextTypes) {
    context[key] = unmaskedContext[key];
  }

  if (__DEV__) {
    var name = getComponentName(workInProgress) || 'Unknown';
    ReactDebugCurrentFrame.current = workInProgress;
    checkReactTypeSpec(contextTypes, context, 'context', name);
    ReactDebugCurrentFrame.current = null;
  }

  if (instance) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return context;
};

exports.hasContextChanged = function () {
  return didPerformWorkStackCursor.current;
};

function isContextConsumer(fiber) {
  return fiber.tag === ClassComponent && fiber.type.contextTypes != null;
}
exports.isContextConsumer = isContextConsumer;

function isContextProvider(fiber) {
  return fiber.tag === ClassComponent && fiber.type.childContextTypes != null;
}
exports.isContextProvider = isContextProvider;

function popContextProvider(fiber) {
  if (!isContextProvider(fiber)) {
    return;
  }

  pop(didPerformWorkStackCursor, fiber);
  pop(contextStackCursor, fiber);
}
exports.popContextProvider = popContextProvider;

exports.pushTopLevelContextObject = function (fiber, context, didChange) {
  invariant(contextStackCursor.cursor == null, 'Unexpected context found on stack');

  push(contextStackCursor, context, fiber);
  push(didPerformWorkStackCursor, didChange, fiber);
};

function processChildContext(fiber, parentContext, isReconciling) {
  var instance = fiber.stateNode;
  var childContextTypes = fiber.type.childContextTypes;

  if (typeof instance.getChildContext !== 'function') {
    if (__DEV__) {
      var componentName = getComponentName(fiber) || 'Unknown';

      if (!warnedAboutMissingGetChildContext[componentName]) {
        warnedAboutMissingGetChildContext[componentName] = true;
        warning(false, '%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
      }
    }
    return parentContext;
  }

  var childContext = void 0;
  if (__DEV__) {
    ReactDebugCurrentFiber.phase = 'getChildContext';
    startPhaseTimer(fiber, 'getChildContext');
    childContext = instance.getChildContext();
    stopPhaseTimer();
    ReactDebugCurrentFiber.phase = null;
  } else {
    childContext = instance.getChildContext();
  }
  for (var contextKey in childContext) {
    invariant(contextKey in childContextTypes, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', getComponentName(fiber) || 'Unknown', contextKey);
  }
  if (__DEV__) {
    var name = getComponentName(fiber) || 'Unknown';

    var workInProgress = isReconciling ? fiber : null;
    ReactDebugCurrentFrame.current = workInProgress;
    checkReactTypeSpec(childContextTypes, childContext, 'child context', name);
    ReactDebugCurrentFrame.current = null;
  }

  return babelHelpers.extends({}, parentContext, childContext);
}
exports.processChildContext = processChildContext;

exports.pushContextProvider = function (workInProgress) {
  if (!isContextProvider(workInProgress)) {
    return false;
  }

  var instance = workInProgress.stateNode;

  var memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyObject;

  previousContext = contextStackCursor.current;
  push(contextStackCursor, memoizedMergedChildContext, workInProgress);
  push(didPerformWorkStackCursor, false, workInProgress);

  return true;
};

exports.invalidateContextProvider = function (workInProgress) {
  var instance = workInProgress.stateNode;
  invariant(instance, 'Expected to have an instance by this point.');

  var mergedContext = processChildContext(workInProgress, previousContext, true);
  instance.__reactInternalMemoizedMergedChildContext = mergedContext;

  pop(didPerformWorkStackCursor, workInProgress);
  pop(contextStackCursor, workInProgress);

  push(contextStackCursor, mergedContext, workInProgress);
  push(didPerformWorkStackCursor, true, workInProgress);
};

exports.resetContext = function () {
  previousContext = emptyObject;
  contextStackCursor.current = emptyObject;
  didPerformWorkStackCursor.current = false;
};

exports.findCurrentUnmaskedContext = function (fiber) {
  invariant(isFiberMounted(fiber) && fiber.tag === ClassComponent, 'Expected subtree parent to be a mounted class component');

  var node = fiber;
  while (node.tag !== HostRoot) {
    if (isContextProvider(node)) {
      return node.stateNode.__reactInternalMemoizedMergedChildContext;
    }
    var parent = node.return;
    invariant(parent, 'Found unexpected detached subtree parent');
    node = parent;
  }
  return node.stateNode.context;
};