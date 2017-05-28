

'use strict';

var _require = require('ReactChildFiber'),
    reconcileChildFibers = _require.reconcileChildFibers;

var _require2 = require('ReactFiberContext'),
    popContextProvider = _require2.popContextProvider;

var ReactTypeOfWork = require('ReactTypeOfWork');
var ReactTypeOfSideEffect = require('ReactTypeOfSideEffect');
var IndeterminateComponent = ReactTypeOfWork.IndeterminateComponent,
    FunctionalComponent = ReactTypeOfWork.FunctionalComponent,
    ClassComponent = ReactTypeOfWork.ClassComponent,
    HostRoot = ReactTypeOfWork.HostRoot,
    HostComponent = ReactTypeOfWork.HostComponent,
    HostText = ReactTypeOfWork.HostText,
    HostPortal = ReactTypeOfWork.HostPortal,
    CoroutineComponent = ReactTypeOfWork.CoroutineComponent,
    CoroutineHandlerPhase = ReactTypeOfWork.CoroutineHandlerPhase,
    YieldComponent = ReactTypeOfWork.YieldComponent,
    Fragment = ReactTypeOfWork.Fragment;
var Ref = ReactTypeOfSideEffect.Ref,
    Update = ReactTypeOfSideEffect.Update;


if (__DEV__) {
  var ReactDebugCurrentFiber = require('ReactDebugCurrentFiber');
}

var invariant = require('fbjs/lib/invariant');

module.exports = function (config, hostContext) {
  var createInstance = config.createInstance,
      createTextInstance = config.createTextInstance,
      appendInitialChild = config.appendInitialChild,
      finalizeInitialChildren = config.finalizeInitialChildren,
      prepareUpdate = config.prepareUpdate;
  var getRootHostContainer = hostContext.getRootHostContainer,
      popHostContext = hostContext.popHostContext,
      getHostContext = hostContext.getHostContext,
      popHostContainer = hostContext.popHostContainer;


  function markChildAsProgressed(current, workInProgress, priorityLevel) {
    workInProgress.progressedChild = workInProgress.child;
    workInProgress.progressedPriority = priorityLevel;
    if (current !== null) {
      current.progressedChild = workInProgress.progressedChild;
      current.progressedPriority = workInProgress.progressedPriority;
    }
  }

  function markUpdate(workInProgress) {
    workInProgress.effectTag |= Update;
  }

  function markRef(workInProgress) {
    workInProgress.effectTag |= Ref;
  }

  function appendAllYields(yields, workInProgress) {
    var node = workInProgress.stateNode;
    if (node) {
      node.return = workInProgress;
    }
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText || node.tag === HostPortal) {
        invariant(false, 'A coroutine cannot have host component children.');
      } else if (node.tag === YieldComponent) {
        yields.push(node.type);
      } else if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === workInProgress) {
          return;
        }
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  function moveCoroutineToHandlerPhase(current, workInProgress) {
    var coroutine = workInProgress.memoizedProps;
    invariant(coroutine, 'Should be resolved by now. This error is likely caused by a bug in ' + 'React. Please file an issue.');

    workInProgress.tag = CoroutineHandlerPhase;

    var yields = [];
    appendAllYields(yields, workInProgress);
    var fn = coroutine.handler;
    var props = coroutine.props;
    var nextChildren = fn(props, yields);

    var currentFirstChild = current !== null ? current.child : null;

    var priority = workInProgress.pendingWorkPriority;
    workInProgress.child = reconcileChildFibers(workInProgress, currentFirstChild, nextChildren, priority);
    markChildAsProgressed(current, workInProgress, priority);
    return workInProgress.child;
  }

  function appendAllChildren(parent, workInProgress) {
    var node = workInProgress.child;
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node.stateNode);
      } else if (node.tag === HostPortal) {} else if (node.child !== null) {
        node = node.child;
        continue;
      }
      if (node === workInProgress) {
        return;
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === workInProgress) {
          return;
        }
        node = node.return;
      }
      node = node.sibling;
    }
  }

  function completeWork(current, workInProgress) {
    if (__DEV__) {
      ReactDebugCurrentFiber.current = workInProgress;
    }

    switch (workInProgress.tag) {
      case FunctionalComponent:
        return null;
      case ClassComponent:
        {
          popContextProvider(workInProgress);
          return null;
        }
      case HostRoot:
        {
          var fiberRoot = workInProgress.stateNode;
          if (fiberRoot.pendingContext) {
            fiberRoot.context = fiberRoot.pendingContext;
            fiberRoot.pendingContext = null;
          }
          return null;
        }
      case HostComponent:
        {
          popHostContext(workInProgress);
          var rootContainerInstance = getRootHostContainer();
          var type = workInProgress.type;
          var newProps = workInProgress.memoizedProps;
          if (current !== null && workInProgress.stateNode != null) {
            var oldProps = current.memoizedProps;

            var instance = workInProgress.stateNode;
            var currentHostContext = getHostContext();
            var updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);

            workInProgress.updateQueue = updatePayload;

            if (updatePayload) {
              markUpdate(workInProgress);
            }
            if (current.ref !== workInProgress.ref) {
              markRef(workInProgress);
            }
          } else {
            if (!newProps) {
              invariant(workInProgress.stateNode !== null, 'We must have new props for new mounts. This error is likely ' + 'caused by a bug in React. Please file an issue.');

              return null;
            }

            var _currentHostContext = getHostContext();

            var _instance = createInstance(type, newProps, rootContainerInstance, _currentHostContext, workInProgress);

            appendAllChildren(_instance, workInProgress);

            if (finalizeInitialChildren(_instance, type, newProps, rootContainerInstance)) {
              markUpdate(workInProgress);
            }

            workInProgress.stateNode = _instance;
            if (workInProgress.ref !== null) {
              markRef(workInProgress);
            }
          }
          return null;
        }
      case HostText:
        {
          var newText = workInProgress.memoizedProps;
          if (current && workInProgress.stateNode != null) {
            var oldText = current.memoizedProps;

            if (oldText !== newText) {
              markUpdate(workInProgress);
            }
          } else {
            if (typeof newText !== 'string') {
              invariant(workInProgress.stateNode !== null, 'We must have new props for new mounts. This error is likely ' + 'caused by a bug in React. Please file an issue.');

              return null;
            }
            var _rootContainerInstance = getRootHostContainer();
            var _currentHostContext2 = getHostContext();
            var textInstance = createTextInstance(newText, _rootContainerInstance, _currentHostContext2, workInProgress);
            workInProgress.stateNode = textInstance;
          }
          return null;
        }
      case CoroutineComponent:
        return moveCoroutineToHandlerPhase(current, workInProgress);
      case CoroutineHandlerPhase:
        workInProgress.tag = CoroutineComponent;
        return null;
      case YieldComponent:
        return null;
      case Fragment:
        return null;
      case HostPortal:
        markUpdate(workInProgress);
        popHostContainer(workInProgress);
        return null;

      case IndeterminateComponent:
        invariant(false, 'An indeterminate component should have become determinate before ' + 'completing. This error is likely caused by a bug in React. Please ' + 'file an issue.');

      default:
        invariant(false, 'Unknown unit of work tag. This error is likely caused by a bug in ' + 'React. Please file an issue.');
    }
  }

  return {
    completeWork: completeWork
  };
};