

'use strict';

var emptyObject = require('fbjs/lib/emptyObject');

var _require = require('ReactFiberStack'),
    createCursor = _require.createCursor,
    pop = _require.pop,
    push = _require.push;

var invariant = require('fbjs/lib/invariant');

module.exports = function (config) {
  var getChildHostContext = config.getChildHostContext,
      getRootHostContext = config.getRootHostContext;


  var contextStackCursor = createCursor(null);
  var contextFiberStackCursor = createCursor(null);
  var rootInstanceStackCursor = createCursor(null);

  function getRootHostContainer() {
    var rootInstance = rootInstanceStackCursor.current;
    invariant(rootInstance !== null, 'Expected root container to exist. This error is likely caused by a ' + 'bug in React. Please file an issue.');
    return rootInstance;
  }

  function pushHostContainer(fiber, nextRootInstance) {
    push(rootInstanceStackCursor, nextRootInstance, fiber);

    var nextRootContext = getRootHostContext(nextRootInstance);

    push(contextFiberStackCursor, fiber, fiber);
    push(contextStackCursor, nextRootContext, fiber);
  }

  function popHostContainer(fiber) {
    pop(contextStackCursor, fiber);
    pop(contextFiberStackCursor, fiber);
    pop(rootInstanceStackCursor, fiber);
  }

  function getHostContext() {
    var context = contextStackCursor.current;
    invariant(context != null, 'Expected host context to exist. This error is likely caused by a bug ' + 'in React. Please file an issue.');
    return context;
  }

  function pushHostContext(fiber) {
    var rootInstance = rootInstanceStackCursor.current;
    invariant(rootInstance != null, 'Expected root host context to exist. This error is likely caused by ' + 'a bug in React. Please file an issue.');

    var context = contextStackCursor.current !== null ? contextStackCursor.current : emptyObject;
    var nextContext = getChildHostContext(context, fiber.type, rootInstance);

    if (context === nextContext) {
      return;
    }

    push(contextFiberStackCursor, fiber, fiber);
    push(contextStackCursor, nextContext, fiber);
  }

  function popHostContext(fiber) {
    if (contextFiberStackCursor.current !== fiber) {
      return;
    }

    pop(contextStackCursor, fiber);
    pop(contextFiberStackCursor, fiber);
  }

  function resetHostContainer() {
    contextStackCursor.current = null;
    rootInstanceStackCursor.current = null;
  }

  return {
    getHostContext: getHostContext,
    getRootHostContainer: getRootHostContainer,
    popHostContainer: popHostContainer,
    popHostContext: popHostContext,
    pushHostContainer: pushHostContainer,
    pushHostContext: pushHostContext,
    resetHostContainer: resetHostContainer
  };
};