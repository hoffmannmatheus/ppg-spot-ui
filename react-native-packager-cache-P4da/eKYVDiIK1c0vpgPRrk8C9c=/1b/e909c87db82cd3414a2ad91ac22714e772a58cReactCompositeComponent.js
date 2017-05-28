

'use strict';

var React = require('react');
var ReactComponentEnvironment = require('ReactComponentEnvironment');
var ReactCompositeComponentTypes = require('ReactCompositeComponentTypes');
var ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
var ReactErrorUtils = require('ReactErrorUtils');
var ReactFeatureFlags = require('ReactFeatureFlags');
var ReactInstanceMap = require('ReactInstanceMap');
var ReactInstrumentation = require('ReactInstrumentation');
var ReactNodeTypes = require('ReactNodeTypes');
var ReactReconciler = require('ReactReconciler');

if (__DEV__) {
  var checkReactTypeSpec = require('checkReactTypeSpec');
  var ReactDebugCurrentFrame = require('react/lib/ReactDebugCurrentFrame');
  var warningAboutMissingGetChildContext = {};
}

var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var shallowEqual = require('fbjs/lib/shallowEqual');
var shouldUpdateReactComponent = require('shouldUpdateReactComponent');
var warning = require('fbjs/lib/warning');

function StatelessComponent(Component) {}
StatelessComponent.prototype.render = function () {
  var Component = ReactInstanceMap.get(this)._currentElement.type;
  var element = Component(this.props, this.context, this.updater);
  return element;
};

function shouldConstruct(Component) {
  return !!(Component.prototype && Component.prototype.isReactComponent);
}

function isPureComponent(Component) {
  return !!(Component.prototype && Component.prototype.isPureReactComponent);
}

function measureLifeCyclePerf(fn, debugID, timerType) {
  if (debugID === 0) {
    return fn();
  }

  ReactInstrumentation.debugTool.onBeginLifeCycleTimer(debugID, timerType);
  try {
    return fn();
  } finally {
    ReactInstrumentation.debugTool.onEndLifeCycleTimer(debugID, timerType);
  }
}

var nextMountID = 1;

var ReactCompositeComponent = {
  construct: function construct(element) {
    this._currentElement = element;
    this._rootNodeID = 0;
    this._compositeType = null;
    this._instance = null;
    this._hostParent = null;
    this._hostContainerInfo = null;

    this._updateBatchNumber = null;
    this._pendingElement = null;
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    this._renderedNodeType = null;
    this._renderedComponent = null;
    this._context = null;
    this._mountOrder = 0;
    this._topLevelWrapper = null;

    this._pendingCallbacks = null;

    this._calledComponentWillUnmount = false;

    if (__DEV__) {
      this._warnedAboutRefsInRender = false;
    }
  },

  mountComponent: function mountComponent(transaction, hostParent, hostContainerInfo, context) {
    var _this = this;

    this._context = context;
    this._mountOrder = nextMountID++;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    var publicProps = this._currentElement.props;
    var publicContext = this._processContext(context);

    var Component = this._currentElement.type;

    var updateQueue = transaction.getUpdateQueue();

    var doConstruct = shouldConstruct(Component);
    var inst = this._constructComponent(doConstruct, publicProps, publicContext, updateQueue);
    var renderedElement;

    if (!doConstruct && (inst == null || inst.render == null)) {
      renderedElement = inst;
      if (__DEV__) {
        warning(!Component.childContextTypes, '%s(...): childContextTypes cannot be defined on a functional component.', Component.displayName || Component.name || 'Component');
      }
      invariant(inst === null || inst === false || React.isValidElement(inst), '%s(...): A valid React element (or null) must be returned. You may have ' + 'returned undefined, an array or some other invalid object.', Component.displayName || Component.name || 'Component');
      inst = new StatelessComponent(Component);
      this._compositeType = ReactCompositeComponentTypes.StatelessFunctional;
    } else {
      if (isPureComponent(Component)) {
        this._compositeType = ReactCompositeComponentTypes.PureClass;
      } else {
        this._compositeType = ReactCompositeComponentTypes.ImpureClass;
      }
    }

    if (__DEV__) {
      if (inst.render == null) {
        warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', Component.displayName || Component.name || 'Component');
      }

      var propsMutated = inst.props !== publicProps;
      var componentName = Component.displayName || Component.name || 'Component';

      warning(inst.props === undefined || !propsMutated, '%s(...): When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", componentName, componentName);
    }

    inst.props = publicProps;
    inst.context = publicContext;
    inst.refs = emptyObject;
    inst.updater = updateQueue;

    this._instance = inst;

    ReactInstanceMap.set(inst, this);

    if (__DEV__) {
      warning(!inst.getInitialState || inst.getInitialState.isReactClassApproved || inst.state, 'getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', this.getName() || 'a component');
      warning(!inst.getDefaultProps || inst.getDefaultProps.isReactClassApproved, 'getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', this.getName() || 'a component');
      warning(!inst.propTypes, 'propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', this.getName() || 'a component');
      warning(!inst.contextTypes, 'contextTypes was defined as an instance property on %s. Use a ' + 'static property to define contextTypes instead.', this.getName() || 'a component');
      warning(typeof inst.componentShouldUpdate !== 'function', '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', this.getName() || 'A component');
      warning(typeof inst.componentDidUnmount !== 'function', '%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', this.getName() || 'A component');
      warning(typeof inst.componentWillRecieveProps !== 'function', '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', this.getName() || 'A component');
    }

    var initialState = inst.state;
    if (initialState === undefined) {
      inst.state = initialState = null;
    }
    invariant(typeof initialState === 'object' && !Array.isArray(initialState), '%s.state: must be set to an object or null', this.getName() || 'ReactCompositeComponent');

    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    if (inst.componentWillMount) {
      if (__DEV__) {
        measureLifeCyclePerf(function () {
          return inst.componentWillMount();
        }, this._debugID, 'componentWillMount');
      } else {
        inst.componentWillMount();
      }

      if (this._pendingStateQueue) {
        inst.state = this._processPendingState(inst.props, inst.context);
      }
    }

    var markup;
    if (inst.unstable_handleError) {
      markup = this.performInitialMountWithErrorHandling(renderedElement, hostParent, hostContainerInfo, transaction, context);
    } else {
      markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
    }

    if (inst.componentDidMount) {
      if (__DEV__) {
        transaction.getReactMountReady().enqueue(function () {
          measureLifeCyclePerf(function () {
            return inst.componentDidMount();
          }, _this._debugID, 'componentDidMount');
        });
      } else {
        transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);
      }
    }

    var callbacks = this._pendingCallbacks;
    if (callbacks) {
      this._pendingCallbacks = null;
      for (var i = 0; i < callbacks.length; i++) {
        transaction.getReactMountReady().enqueue(callbacks[i], inst);
      }
    }

    return markup;
  },

  _constructComponent: function _constructComponent(doConstruct, publicProps, publicContext, updateQueue) {
    if (__DEV__) {
      ReactCurrentOwner.current = this;
      try {
        return this._constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue);
      } finally {
        ReactCurrentOwner.current = null;
      }
    } else {
      return this._constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue);
    }
  },

  _constructComponentWithoutOwner: function _constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue) {
    var Component = this._currentElement.type;

    if (doConstruct) {
      if (__DEV__) {
        return measureLifeCyclePerf(function () {
          return new Component(publicProps, publicContext, updateQueue);
        }, this._debugID, 'ctor');
      } else {
        return new Component(publicProps, publicContext, updateQueue);
      }
    }

    if (__DEV__) {
      return measureLifeCyclePerf(function () {
        return Component(publicProps, publicContext, updateQueue);
      }, this._debugID, 'render');
    } else {
      return Component(publicProps, publicContext, updateQueue);
    }
  },

  performInitialMountWithErrorHandling: function performInitialMountWithErrorHandling(renderedElement, hostParent, hostContainerInfo, transaction, context) {
    var markup;
    var checkpoint = transaction.checkpoint();
    try {
      markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
    } catch (e) {
      transaction.rollback(checkpoint);
      this._instance.unstable_handleError(e);
      if (this._pendingStateQueue) {
        this._instance.state = this._processPendingState(this._instance.props, this._instance.context);
      }
      checkpoint = transaction.checkpoint();
      this._renderedComponent.unmountComponent(true, true);
      transaction.rollback(checkpoint);

      markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
    }
    return markup;
  },

  performInitialMount: function performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context) {
    if (renderedElement === undefined) {
      renderedElement = this._renderValidatedComponent();
    }

    var nodeType = ReactNodeTypes.getType(renderedElement);
    this._renderedNodeType = nodeType;
    var child = this._instantiateReactComponent(renderedElement, nodeType !== ReactNodeTypes.EMPTY);
    this._renderedComponent = child;

    var debugID = 0;
    if (__DEV__) {
      debugID = this._debugID;
    }

    var markup = ReactReconciler.mountComponent(child, transaction, hostParent, hostContainerInfo, this._processChildContext(context), debugID);

    if (__DEV__) {
      if (debugID !== 0) {
        var childDebugIDs = child._debugID !== 0 ? [child._debugID] : [];
        ReactInstrumentation.debugTool.onSetChildren(debugID, childDebugIDs);
      }
    }

    return markup;
  },

  getHostNode: function getHostNode() {
    return ReactReconciler.getHostNode(this._renderedComponent);
  },

  unmountComponent: function unmountComponent(safely, skipLifecycle) {
    if (!this._renderedComponent) {
      return;
    }

    var inst = this._instance;

    if (inst.componentWillUnmount && !inst._calledComponentWillUnmount) {
      inst._calledComponentWillUnmount = true;

      if (safely) {
        if (!skipLifecycle) {
          var name = this.getName() + '.componentWillUnmount()';
          ReactErrorUtils.invokeGuardedCallbackAndCatchFirstError(name, inst.componentWillUnmount, inst);
        }
      } else {
        if (__DEV__) {
          measureLifeCyclePerf(function () {
            return inst.componentWillUnmount();
          }, this._debugID, 'componentWillUnmount');
        } else {
          inst.componentWillUnmount();
        }
      }
    }

    if (this._renderedComponent) {
      ReactReconciler.unmountComponent(this._renderedComponent, safely, skipLifecycle);
      this._renderedNodeType = null;
      this._renderedComponent = null;
      this._instance = null;
    }

    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;
    this._pendingCallbacks = null;
    this._pendingElement = null;

    this._context = null;
    this._rootNodeID = 0;
    this._topLevelWrapper = null;

    ReactInstanceMap.remove(inst);
  },

  _maskContext: function _maskContext(context) {
    var Component = this._currentElement.type;
    var contextTypes = Component.contextTypes;
    if (!contextTypes) {
      return emptyObject;
    }
    var maskedContext = {};
    for (var contextName in contextTypes) {
      maskedContext[contextName] = context[contextName];
    }
    return maskedContext;
  },

  _processContext: function _processContext(context) {
    var maskedContext = this._maskContext(context);
    if (__DEV__) {
      var Component = this._currentElement.type;
      if (Component.contextTypes) {
        this._checkContextTypes(Component.contextTypes, maskedContext, 'context');
      }
    }
    return maskedContext;
  },

  _processChildContext: function _processChildContext(currentContext) {
    var Component = this._currentElement.type;
    var inst = this._instance;
    var childContext;

    if (typeof inst.getChildContext === 'function') {
      if (__DEV__) {
        ReactInstrumentation.debugTool.onBeginProcessingChildContext();
        try {
          childContext = inst.getChildContext();
        } finally {
          ReactInstrumentation.debugTool.onEndProcessingChildContext();
        }
      } else {
        childContext = inst.getChildContext();
      }

      invariant(typeof Component.childContextTypes === 'object', '%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', this.getName() || 'ReactCompositeComponent');
      if (__DEV__) {
        this._checkContextTypes(Component.childContextTypes, childContext, 'child context');
      }
      for (var name in childContext) {
        invariant(name in Component.childContextTypes, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', this.getName() || 'ReactCompositeComponent', name);
      }
      return babelHelpers.extends({}, currentContext, childContext);
    } else {
      if (__DEV__) {
        var componentName = this.getName();

        if (!warningAboutMissingGetChildContext[componentName]) {
          warningAboutMissingGetChildContext[componentName] = true;
          warning(!Component.childContextTypes, '%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
        }
      }
    }
    return currentContext;
  },

  _checkContextTypes: function _checkContextTypes(typeSpecs, values, location) {
    if (__DEV__) {
      ReactDebugCurrentFrame.current = this._debugID;
      checkReactTypeSpec(typeSpecs, values, location, this.getName());
      ReactDebugCurrentFrame.current = null;
    }
  },

  receiveComponent: function receiveComponent(nextElement, transaction, nextContext) {
    var prevElement = this._currentElement;
    var prevContext = this._context;

    this._pendingElement = null;

    this.updateComponent(transaction, prevElement, nextElement, prevContext, nextContext);
  },

  performUpdateIfNecessary: function performUpdateIfNecessary(transaction) {
    if (this._pendingElement != null) {
      ReactReconciler.receiveComponent(this, this._pendingElement, transaction, this._context);
    } else if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
      this.updateComponent(transaction, this._currentElement, this._currentElement, this._context, this._context);
    } else {
      var callbacks = this._pendingCallbacks;
      this._pendingCallbacks = null;
      if (callbacks) {
        for (var j = 0; j < callbacks.length; j++) {
          transaction.getReactMountReady().enqueue(callbacks[j], this.getPublicInstance());
        }
      }
      this._updateBatchNumber = null;
    }
  },

  updateComponent: function updateComponent(transaction, prevParentElement, nextParentElement, prevUnmaskedContext, nextUnmaskedContext) {
    var inst = this._instance;
    invariant(inst != null, 'Attempted to update component `%s` that has already been unmounted ' + '(or failed to mount).', this.getName() || 'ReactCompositeComponent');

    var willReceive = false;
    var nextContext;

    if (this._context === nextUnmaskedContext) {
      nextContext = inst.context;
    } else {
      nextContext = this._processContext(nextUnmaskedContext);
      willReceive = true;
    }

    var prevProps = prevParentElement.props;
    var nextProps = nextParentElement.props;

    if (prevParentElement !== nextParentElement) {
      willReceive = true;
    }

    if (willReceive && inst.componentWillReceiveProps) {
      var beforeState = inst.state;
      if (__DEV__) {
        measureLifeCyclePerf(function () {
          return inst.componentWillReceiveProps(nextProps, nextContext);
        }, this._debugID, 'componentWillReceiveProps');
      } else {
        inst.componentWillReceiveProps(nextProps, nextContext);
      }
      var afterState = inst.state;
      if (beforeState !== afterState) {
        inst.state = beforeState;
        inst.updater.enqueueReplaceState(inst, afterState);
        if (__DEV__) {
          warning(false, '%s.componentWillReceiveProps(): Assigning directly to ' + "this.state is deprecated (except inside a component's " + 'constructor). Use setState instead.', this.getName() || 'ReactCompositeComponent');
        }
      }
    }

    var callbacks = this._pendingCallbacks;
    this._pendingCallbacks = null;

    var nextState = this._processPendingState(nextProps, nextContext);
    var shouldUpdate = true;
    if (!this._pendingForceUpdate) {
      var prevState = inst.state;
      shouldUpdate = willReceive || nextState !== prevState;
      if (inst.shouldComponentUpdate) {
        if (__DEV__) {
          shouldUpdate = measureLifeCyclePerf(function () {
            return inst.shouldComponentUpdate(nextProps, nextState, nextContext);
          }, this._debugID, 'shouldComponentUpdate');
        } else {
          shouldUpdate = inst.shouldComponentUpdate(nextProps, nextState, nextContext);
        }
      } else {
        if (this._compositeType === ReactCompositeComponentTypes.PureClass) {
          shouldUpdate = !shallowEqual(prevProps, nextProps) || !shallowEqual(inst.state, nextState);
        }
      }
    }

    if (__DEV__) {
      warning(shouldUpdate !== undefined, '%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', this.getName() || 'ReactCompositeComponent');
    }

    this._updateBatchNumber = null;
    if (shouldUpdate) {
      this._pendingForceUpdate = false;

      this._performComponentUpdate(nextParentElement, nextProps, nextState, nextContext, transaction, nextUnmaskedContext);
    } else {
      this._currentElement = nextParentElement;
      this._context = nextUnmaskedContext;
      inst.props = nextProps;
      inst.state = nextState;
      inst.context = nextContext;
    }

    if (callbacks) {
      for (var j = 0; j < callbacks.length; j++) {
        transaction.getReactMountReady().enqueue(callbacks[j], this.getPublicInstance());
      }
    }
  },

  _processPendingState: function _processPendingState(props, context) {
    var inst = this._instance;
    var queue = this._pendingStateQueue;
    var replace = this._pendingReplaceState;
    this._pendingReplaceState = false;
    this._pendingStateQueue = null;

    if (!queue) {
      return inst.state;
    }

    if (replace && queue.length === 1) {
      return queue[0];
    }

    var nextState = replace ? queue[0] : inst.state;
    var dontMutate = true;
    for (var i = replace ? 1 : 0; i < queue.length; i++) {
      var partial = queue[i];
      var partialState = typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial;
      if (partialState) {
        if (dontMutate) {
          dontMutate = false;
          nextState = babelHelpers.extends({}, nextState, partialState);
        } else {
          babelHelpers.extends(nextState, partialState);
        }
      }
    }

    return nextState;
  },

  _performComponentUpdate: function _performComponentUpdate(nextElement, nextProps, nextState, nextContext, transaction, unmaskedContext) {
    var _this2 = this;

    var inst = this._instance;

    var hasComponentDidUpdate = !!inst.componentDidUpdate;
    var prevProps;
    var prevState;
    var prevContext;
    if (hasComponentDidUpdate) {
      prevProps = inst.props;
      prevState = inst.state;
      prevContext = inst.context;
    }

    if (inst.componentWillUpdate) {
      if (__DEV__) {
        measureLifeCyclePerf(function () {
          return inst.componentWillUpdate(nextProps, nextState, nextContext);
        }, this._debugID, 'componentWillUpdate');
      } else {
        inst.componentWillUpdate(nextProps, nextState, nextContext);
      }
    }

    this._currentElement = nextElement;
    this._context = unmaskedContext;
    inst.props = nextProps;
    inst.state = nextState;
    inst.context = nextContext;

    if (inst.unstable_handleError) {
      this._updateRenderedComponentWithErrorHandling(transaction, unmaskedContext);
    } else {
      this._updateRenderedComponent(transaction, unmaskedContext);
    }

    if (hasComponentDidUpdate) {
      if (__DEV__) {
        transaction.getReactMountReady().enqueue(function () {
          measureLifeCyclePerf(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), _this2._debugID, 'componentDidUpdate');
        });
      } else {
        transaction.getReactMountReady().enqueue(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), inst);
      }
    }
  },

  _updateRenderedComponentWithErrorHandling: function _updateRenderedComponentWithErrorHandling(transaction, context) {
    var checkpoint = transaction.checkpoint();
    try {
      this._updateRenderedComponent(transaction, context);
    } catch (e) {
      transaction.rollback(checkpoint);
      this._instance.unstable_handleError(e);
      if (this._pendingStateQueue) {
        this._instance.state = this._processPendingState(this._instance.props, this._instance.context);
      }
      checkpoint = transaction.checkpoint();

      this._updateRenderedComponentWithNextElement(transaction, context, null, true);

      this._updateRenderedComponent(transaction, context);
    }
  },

  _updateRenderedComponent: function _updateRenderedComponent(transaction, context) {
    var nextRenderedElement = this._renderValidatedComponent();
    this._updateRenderedComponentWithNextElement(transaction, context, nextRenderedElement, false);
  },

  _updateRenderedComponentWithNextElement: function _updateRenderedComponentWithNextElement(transaction, context, nextRenderedElement, safely) {
    var prevComponentInstance = this._renderedComponent;
    var prevRenderedElement = prevComponentInstance._currentElement;

    var debugID = 0;
    if (__DEV__) {
      debugID = this._debugID;
    }

    if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
      ReactReconciler.receiveComponent(prevComponentInstance, nextRenderedElement, transaction, this._processChildContext(context));
    } else {
      var oldHostNode = ReactReconciler.getHostNode(prevComponentInstance);

      if (!ReactFeatureFlags.prepareNewChildrenBeforeUnmountInStack) {
        ReactReconciler.unmountComponent(prevComponentInstance, safely, false);
      }

      var nodeType = ReactNodeTypes.getType(nextRenderedElement);
      this._renderedNodeType = nodeType;
      var child = this._instantiateReactComponent(nextRenderedElement, nodeType !== ReactNodeTypes.EMPTY);
      this._renderedComponent = child;

      var nextMarkup = ReactReconciler.mountComponent(child, transaction, this._hostParent, this._hostContainerInfo, this._processChildContext(context), debugID);

      if (ReactFeatureFlags.prepareNewChildrenBeforeUnmountInStack) {
        ReactReconciler.unmountComponent(prevComponentInstance, safely, false);
      }

      if (__DEV__) {
        if (debugID !== 0) {
          var childDebugIDs = child._debugID !== 0 ? [child._debugID] : [];
          ReactInstrumentation.debugTool.onSetChildren(debugID, childDebugIDs);
        }
      }

      this._replaceNodeWithMarkup(oldHostNode, nextMarkup, prevComponentInstance);
    }
  },

  _replaceNodeWithMarkup: function _replaceNodeWithMarkup(oldHostNode, nextMarkup, prevInstance) {
    ReactComponentEnvironment.replaceNodeWithMarkup(oldHostNode, nextMarkup, prevInstance);
  },

  _renderValidatedComponentWithoutOwnerOrContext: function _renderValidatedComponentWithoutOwnerOrContext() {
    var inst = this._instance;
    var renderedElement;

    if (__DEV__) {
      renderedElement = measureLifeCyclePerf(function () {
        return inst.render();
      }, this._debugID, 'render');
    } else {
      renderedElement = inst.render();
    }

    if (__DEV__) {
      if (renderedElement === undefined && inst.render._isMockFunction) {
        renderedElement = null;
      }
    }

    return renderedElement;
  },

  _renderValidatedComponent: function _renderValidatedComponent() {
    var renderedElement;
    if (__DEV__ || this._compositeType !== ReactCompositeComponentTypes.StatelessFunctional) {
      ReactCurrentOwner.current = this;
      try {
        renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();
      } finally {
        ReactCurrentOwner.current = null;
      }
    } else {
      renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();
    }
    invariant(renderedElement === null || renderedElement === false || React.isValidElement(renderedElement), '%s.render(): A valid React element (or null) must be returned. You may have ' + 'returned undefined, an array or some other invalid object.', this.getName() || 'ReactCompositeComponent');

    return renderedElement;
  },

  attachRef: function attachRef(ref, component) {
    var inst = this.getPublicInstance();
    invariant(inst != null, 'Stateless function components cannot have refs.');
    var publicComponentInstance = component.getPublicInstance();
    var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
    refs[ref] = publicComponentInstance;
  },

  detachRef: function detachRef(ref) {
    var refs = this.getPublicInstance().refs;
    delete refs[ref];
  },

  getName: function getName() {
    var type = this._currentElement.type;
    var constructor = this._instance && this._instance.constructor;
    return type.displayName || constructor && constructor.displayName || type.name || constructor && constructor.name || null;
  },

  getPublicInstance: function getPublicInstance() {
    var inst = this._instance;
    if (this._compositeType === ReactCompositeComponentTypes.StatelessFunctional) {
      return null;
    }
    return inst;
  },

  _instantiateReactComponent: null
};

module.exports = ReactCompositeComponent;