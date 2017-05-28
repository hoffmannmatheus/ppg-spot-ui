

'use strict';

var _require = require('ReactTypeOfSideEffect'),
    Update = _require.Update;

var _require2 = require('ReactFiberContext'),
    cacheContext = _require2.cacheContext,
    getMaskedContext = _require2.getMaskedContext,
    getUnmaskedContext = _require2.getUnmaskedContext,
    isContextConsumer = _require2.isContextConsumer;

var _require3 = require('ReactFiberUpdateQueue'),
    addUpdate = _require3.addUpdate,
    addReplaceUpdate = _require3.addReplaceUpdate,
    addForceUpdate = _require3.addForceUpdate,
    beginUpdateQueue = _require3.beginUpdateQueue;

var _require4 = require('ReactFiberContext'),
    hasContextChanged = _require4.hasContextChanged;

var _require5 = require('ReactFiberTreeReflection'),
    isMounted = _require5.isMounted;

var ReactInstanceMap = require('ReactInstanceMap');
var emptyObject = require('fbjs/lib/emptyObject');
var getComponentName = require('getComponentName');
var shallowEqual = require('fbjs/lib/shallowEqual');
var invariant = require('fbjs/lib/invariant');

var isArray = Array.isArray;

if (__DEV__) {
  var _require6 = require('ReactDebugFiberPerf'),
      startPhaseTimer = _require6.startPhaseTimer,
      stopPhaseTimer = _require6.stopPhaseTimer;

  var warning = require('fbjs/lib/warning');
  var warnOnInvalidCallback = function warnOnInvalidCallback(callback, callerName) {
    warning(callback === null || typeof callback === 'function', '%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
  };
}

module.exports = function (scheduleUpdate, getPriorityContext, memoizeProps, memoizeState) {
  var updater = {
    isMounted: isMounted,
    enqueueSetState: function enqueueSetState(instance, partialState, callback) {
      var fiber = ReactInstanceMap.get(instance);
      var priorityLevel = getPriorityContext();
      callback = callback === undefined ? null : callback;
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      addUpdate(fiber, partialState, callback, priorityLevel);
      scheduleUpdate(fiber, priorityLevel);
    },
    enqueueReplaceState: function enqueueReplaceState(instance, state, callback) {
      var fiber = ReactInstanceMap.get(instance);
      var priorityLevel = getPriorityContext();
      callback = callback === undefined ? null : callback;
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'replaceState');
      }
      addReplaceUpdate(fiber, state, callback, priorityLevel);
      scheduleUpdate(fiber, priorityLevel);
    },
    enqueueForceUpdate: function enqueueForceUpdate(instance, callback) {
      var fiber = ReactInstanceMap.get(instance);
      var priorityLevel = getPriorityContext();
      callback = callback === undefined ? null : callback;
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'forceUpdate');
      }
      addForceUpdate(fiber, callback, priorityLevel);
      scheduleUpdate(fiber, priorityLevel);
    }
  };

  function checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext) {
    if (oldProps === null || workInProgress.updateQueue !== null && workInProgress.updateQueue.hasForceUpdate) {
      return true;
    }

    var instance = workInProgress.stateNode;
    if (typeof instance.shouldComponentUpdate === 'function') {
      if (__DEV__) {
        startPhaseTimer(workInProgress, 'shouldComponentUpdate');
      }
      var shouldUpdate = instance.shouldComponentUpdate(newProps, newState, newContext);
      if (__DEV__) {
        stopPhaseTimer();
      }

      if (__DEV__) {
        warning(shouldUpdate !== undefined, '%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', getComponentName(workInProgress) || 'Unknown');
      }

      return shouldUpdate;
    }

    var type = workInProgress.type;
    if (type.prototype && type.prototype.isPureReactComponent) {
      return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState);
    }

    return true;
  }

  function checkClassInstance(workInProgress) {
    var instance = workInProgress.stateNode;
    if (__DEV__) {
      var name = getComponentName(workInProgress);
      var renderPresent = instance.render;
      warning(renderPresent, '%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', name);
      var noGetInitialStateOnES6 = !instance.getInitialState || instance.getInitialState.isReactClassApproved || instance.state;
      warning(noGetInitialStateOnES6, 'getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name);
      var noGetDefaultPropsOnES6 = !instance.getDefaultProps || instance.getDefaultProps.isReactClassApproved;
      warning(noGetDefaultPropsOnES6, 'getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name);
      var noInstancePropTypes = !instance.propTypes;
      warning(noInstancePropTypes, 'propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', name);
      var noInstanceContextTypes = !instance.contextTypes;
      warning(noInstanceContextTypes, 'contextTypes was defined as an instance property on %s. Use a static ' + 'property to define contextTypes instead.', name);
      var noComponentShouldUpdate = typeof instance.componentShouldUpdate !== 'function';
      warning(noComponentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name);
      var noComponentDidUnmount = typeof instance.componentDidUnmount !== 'function';
      warning(noComponentDidUnmount, '%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name);
      var noComponentWillRecieveProps = typeof instance.componentWillRecieveProps !== 'function';
      warning(noComponentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name);
      var hasMutatedProps = instance.props !== workInProgress.pendingProps;
      warning(instance.props === undefined || !hasMutatedProps, '%s(...): When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", name, name);
    }

    var state = instance.state;
    if (state && (typeof state !== 'object' || isArray(state))) {
      invariant(false, '%s.state: must be set to an object or null', getComponentName(workInProgress));
    }
    if (typeof instance.getChildContext === 'function') {
      invariant(typeof workInProgress.type.childContextTypes === 'object', '%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', getComponentName(workInProgress));
    }
  }

  function resetInputPointers(workInProgress, instance) {
    instance.props = workInProgress.memoizedProps;
    instance.state = workInProgress.memoizedState;
  }

  function adoptClassInstance(workInProgress, instance) {
    instance.updater = updater;
    workInProgress.stateNode = instance;

    ReactInstanceMap.set(instance, workInProgress);
  }

  function constructClassInstance(workInProgress) {
    var ctor = workInProgress.type;
    var props = workInProgress.pendingProps;
    var unmaskedContext = getUnmaskedContext(workInProgress);
    var needsContext = isContextConsumer(workInProgress);
    var context = needsContext ? getMaskedContext(workInProgress, unmaskedContext) : emptyObject;
    var instance = new ctor(props, context);
    adoptClassInstance(workInProgress, instance);
    checkClassInstance(workInProgress);

    if (needsContext) {
      cacheContext(workInProgress, unmaskedContext, context);
    }

    return instance;
  }

  function mountClassInstance(workInProgress, priorityLevel) {
    var instance = workInProgress.stateNode;
    var state = instance.state || null;

    var props = workInProgress.pendingProps;
    invariant(props, 'There must be pending props for an initial mount. This error is ' + 'likely caused by a bug in React. Please file an issue.');

    var unmaskedContext = getUnmaskedContext(workInProgress);

    instance.props = props;
    instance.state = state;
    instance.refs = emptyObject;
    instance.context = getMaskedContext(workInProgress, unmaskedContext);

    if (typeof instance.componentWillMount === 'function') {
      if (__DEV__) {
        startPhaseTimer(workInProgress, 'componentWillMount');
      }
      instance.componentWillMount();
      if (__DEV__) {
        stopPhaseTimer();
      }

      var updateQueue = workInProgress.updateQueue;
      if (updateQueue !== null) {
        instance.state = beginUpdateQueue(workInProgress, updateQueue, instance, state, props, priorityLevel);
      }
    }
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= Update;
    }
  }

  function resumeMountClassInstance(workInProgress, priorityLevel) {
    var instance = workInProgress.stateNode;
    resetInputPointers(workInProgress, instance);

    var newState = workInProgress.memoizedState;
    var newProps = workInProgress.pendingProps;
    if (!newProps) {
      newProps = workInProgress.memoizedProps;
      invariant(newProps != null, 'There should always be pending or memoized props. This error is ' + 'likely caused by a bug in React. Please file an issue.');
    }
    var newUnmaskedContext = getUnmaskedContext(workInProgress);
    var newContext = getMaskedContext(workInProgress, newUnmaskedContext);

    if (!checkShouldComponentUpdate(workInProgress, workInProgress.memoizedProps, newProps, workInProgress.memoizedState, newState, newContext)) {
      instance.props = newProps;
      instance.state = newState;
      instance.context = newContext;
      return false;
    }

    var newInstance = constructClassInstance(workInProgress);
    newInstance.props = newProps;
    newInstance.state = newState = newInstance.state || null;
    newInstance.context = newContext;

    if (typeof newInstance.componentWillMount === 'function') {
      if (__DEV__) {
        startPhaseTimer(workInProgress, 'componentWillMount');
      }
      newInstance.componentWillMount();
      if (__DEV__) {
        stopPhaseTimer();
      }
    }

    var newUpdateQueue = workInProgress.updateQueue;
    if (newUpdateQueue !== null) {
      newInstance.state = beginUpdateQueue(workInProgress, newUpdateQueue, newInstance, newState, newProps, priorityLevel);
    }
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= Update;
    }
    return true;
  }

  function updateClassInstance(current, workInProgress, priorityLevel) {
    var instance = workInProgress.stateNode;
    resetInputPointers(workInProgress, instance);

    var oldProps = workInProgress.memoizedProps;
    var newProps = workInProgress.pendingProps;
    if (!newProps) {
      newProps = oldProps;
      invariant(newProps != null, 'There should always be pending or memoized props. This error is ' + 'likely caused by a bug in React. Please file an issue.');
    }
    var oldContext = instance.context;
    var newUnmaskedContext = getUnmaskedContext(workInProgress);
    var newContext = getMaskedContext(workInProgress, newUnmaskedContext);

    if (oldProps !== newProps || oldContext !== newContext) {
      if (typeof instance.componentWillReceiveProps === 'function') {
        if (__DEV__) {
          startPhaseTimer(workInProgress, 'componentWillReceiveProps');
        }
        instance.componentWillReceiveProps(newProps, newContext);
        if (__DEV__) {
          stopPhaseTimer();
        }

        if (instance.state !== workInProgress.memoizedState) {
          if (__DEV__) {
            warning(false, '%s.componentWillReceiveProps(): Assigning directly to ' + "this.state is deprecated (except inside a component's " + 'constructor). Use setState instead.', getComponentName(workInProgress));
          }
          updater.enqueueReplaceState(instance, instance.state, null);
        }
      }
    }

    var updateQueue = workInProgress.updateQueue;
    var oldState = workInProgress.memoizedState;

    var newState = void 0;
    if (updateQueue !== null) {
      newState = beginUpdateQueue(workInProgress, updateQueue, instance, oldState, newProps, priorityLevel);
    } else {
      newState = oldState;
    }

    if (oldProps === newProps && oldState === newState && !hasContextChanged() && !(updateQueue !== null && updateQueue.hasForceUpdate)) {
      if (typeof instance.componentDidUpdate === 'function') {
        if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
          workInProgress.effectTag |= Update;
        }
      }
      return false;
    }

    var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);

    if (shouldUpdate) {
      if (typeof instance.componentWillUpdate === 'function') {
        if (__DEV__) {
          startPhaseTimer(workInProgress, 'componentWillUpdate');
        }
        instance.componentWillUpdate(newProps, newState, newContext);
        if (__DEV__) {
          stopPhaseTimer();
        }
      }
      if (typeof instance.componentDidUpdate === 'function') {
        workInProgress.effectTag |= Update;
      }
    } else {
      if (typeof instance.componentDidUpdate === 'function') {
        if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
          workInProgress.effectTag |= Update;
        }
      }

      memoizeProps(workInProgress, newProps);
      memoizeState(workInProgress, newState);
    }

    instance.props = newProps;
    instance.state = newState;
    instance.context = newContext;

    return shouldUpdate;
  }

  return {
    adoptClassInstance: adoptClassInstance,
    constructClassInstance: constructClassInstance,
    mountClassInstance: mountClassInstance,
    resumeMountClassInstance: resumeMountClassInstance,
    updateClassInstance: updateClassInstance
  };
};