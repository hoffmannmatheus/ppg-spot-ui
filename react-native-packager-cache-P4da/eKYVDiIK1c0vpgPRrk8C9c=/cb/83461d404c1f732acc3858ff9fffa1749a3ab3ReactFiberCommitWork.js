

'use strict';

var ReactTypeOfWork = require('ReactTypeOfWork');
var ClassComponent = ReactTypeOfWork.ClassComponent,
    HostRoot = ReactTypeOfWork.HostRoot,
    HostComponent = ReactTypeOfWork.HostComponent,
    HostText = ReactTypeOfWork.HostText,
    HostPortal = ReactTypeOfWork.HostPortal,
    CoroutineComponent = ReactTypeOfWork.CoroutineComponent;

var _require = require('ReactFiberUpdateQueue'),
    commitCallbacks = _require.commitCallbacks;

var _require2 = require('ReactFiberDevToolsHook'),
    onCommitUnmount = _require2.onCommitUnmount;

var _require3 = require('ReactErrorUtils'),
    invokeGuardedCallback = _require3.invokeGuardedCallback;

var _require4 = require('ReactTypeOfSideEffect'),
    Placement = _require4.Placement,
    Update = _require4.Update,
    Callback = _require4.Callback,
    ContentReset = _require4.ContentReset;

var invariant = require('fbjs/lib/invariant');

if (__DEV__) {
  var _require5 = require('ReactDebugFiberPerf'),
      startPhaseTimer = _require5.startPhaseTimer,
      stopPhaseTimer = _require5.stopPhaseTimer;
}

module.exports = function (config, captureError) {
  var commitMount = config.commitMount,
      commitUpdate = config.commitUpdate,
      resetTextContent = config.resetTextContent,
      commitTextUpdate = config.commitTextUpdate,
      appendChild = config.appendChild,
      insertBefore = config.insertBefore,
      removeChild = config.removeChild,
      getPublicInstance = config.getPublicInstance;


  if (__DEV__) {
    var callComponentWillUnmountWithTimerInDev = function callComponentWillUnmountWithTimerInDev(current, instance) {
      startPhaseTimer(current, 'componentWillUnmount');
      instance.componentWillUnmount();
      stopPhaseTimer();
    };
  }

  function safelyCallComponentWillUnmount(current, instance) {
    if (__DEV__) {
      var unmountError = invokeGuardedCallback(null, callComponentWillUnmountWithTimerInDev, null, current, instance);
      if (unmountError) {
        captureError(current, unmountError);
      }
    } else {
      try {
        instance.componentWillUnmount();
      } catch (unmountError) {
        captureError(current, unmountError);
      }
    }
  }

  function safelyDetachRef(current) {
    var ref = current.ref;
    if (ref !== null) {
      if (__DEV__) {
        var refError = invokeGuardedCallback(null, ref, null, null);
        if (refError !== null) {
          captureError(current, refError);
        }
      } else {
        try {
          ref(null);
        } catch (refError) {
          captureError(current, refError);
        }
      }
    }
  }

  function getHostParent(fiber) {
    var parent = fiber.return;
    while (parent !== null) {
      switch (parent.tag) {
        case HostComponent:
          return parent.stateNode;
        case HostRoot:
          return parent.stateNode.containerInfo;
        case HostPortal:
          return parent.stateNode.containerInfo;
      }
      parent = parent.return;
    }
    invariant(false, 'Expected to find a host parent. This error is likely caused by a bug ' + 'in React. Please file an issue.');
  }

  function getHostParentFiber(fiber) {
    var parent = fiber.return;
    while (parent !== null) {
      if (isHostParent(parent)) {
        return parent;
      }
      parent = parent.return;
    }
    invariant(false, 'Expected to find a host parent. This error is likely caused by a bug ' + 'in React. Please file an issue.');
  }

  function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal;
  }

  function getHostSibling(fiber) {
    var node = fiber;
    siblings: while (true) {
      while (node.sibling === null) {
        if (node.return === null || isHostParent(node.return)) {
          return null;
        }
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
      while (node.tag !== HostComponent && node.tag !== HostText) {
        if (node.effectTag & Placement) {
          continue siblings;
        }

        if (node.child === null || node.tag === HostPortal) {
          continue siblings;
        } else {
          node.child.return = node;
          node = node.child;
        }
      }

      if (!(node.effectTag & Placement)) {
        return node.stateNode;
      }
    }
  }

  function commitPlacement(finishedWork) {
    var parentFiber = getHostParentFiber(finishedWork);
    var parent = void 0;
    switch (parentFiber.tag) {
      case HostComponent:
        parent = parentFiber.stateNode;
        break;
      case HostRoot:
        parent = parentFiber.stateNode.containerInfo;
        break;
      case HostPortal:
        parent = parentFiber.stateNode.containerInfo;
        break;
      default:
        invariant(false, 'Invalid host parent fiber. This error is likely caused by a bug ' + 'in React. Please file an issue.');
    }
    if (parentFiber.effectTag & ContentReset) {
      resetTextContent(parent);

      parentFiber.effectTag &= ~ContentReset;
    }

    var before = getHostSibling(finishedWork);

    var node = finishedWork;
    while (true) {
      if (node.tag === HostComponent || node.tag === HostText) {
        if (before) {
          insertBefore(parent, node.stateNode, before);
        } else {
          appendChild(parent, node.stateNode);
        }
      } else if (node.tag === HostPortal) {} else if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === finishedWork) {
        return;
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === finishedWork) {
          return;
        }
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  function commitNestedUnmounts(root) {
    var node = root;
    while (true) {
      commitUnmount(node);

      if (node.child !== null && node.tag !== HostPortal) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === root) {
        return;
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === root) {
          return;
        }
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  function unmountHostComponents(parent, current) {
    var node = current;
    while (true) {
      if (node.tag === HostComponent || node.tag === HostText) {
        commitNestedUnmounts(node);

        removeChild(parent, node.stateNode);
      } else if (node.tag === HostPortal) {
        parent = node.stateNode.containerInfo;

        if (node.child !== null) {
          node.child.return = node;
          node = node.child;
          continue;
        }
      } else {
        commitUnmount(node);

        if (node.child !== null) {
          node.child.return = node;
          node = node.child;
          continue;
        }
      }
      if (node === current) {
        return;
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === current) {
          return;
        }
        node = node.return;
        if (node.tag === HostPortal) {
          parent = getHostParent(node);
        }
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  function commitDeletion(current) {
    var parent = getHostParent(current);

    unmountHostComponents(parent, current);

    current.return = null;
    current.child = null;
    if (current.alternate) {
      current.alternate.child = null;
      current.alternate.return = null;
    }
  }

  function commitUnmount(current) {
    if (typeof onCommitUnmount === 'function') {
      onCommitUnmount(current);
    }

    switch (current.tag) {
      case ClassComponent:
        {
          safelyDetachRef(current);
          var instance = current.stateNode;
          if (typeof instance.componentWillUnmount === 'function') {
            safelyCallComponentWillUnmount(current, instance);
          }
          return;
        }
      case HostComponent:
        {
          safelyDetachRef(current);
          return;
        }
      case CoroutineComponent:
        {
          commitNestedUnmounts(current.stateNode);
          return;
        }
      case HostPortal:
        {
          var parent = getHostParent(current);
          unmountHostComponents(parent, current);
          return;
        }
    }
  }

  function commitWork(current, finishedWork) {
    switch (finishedWork.tag) {
      case ClassComponent:
        {
          return;
        }
      case HostComponent:
        {
          var instance = finishedWork.stateNode;
          if (instance != null && current !== null) {
            var newProps = finishedWork.memoizedProps;
            var oldProps = current.memoizedProps;
            var type = finishedWork.type;

            var updatePayload = finishedWork.updateQueue;
            finishedWork.updateQueue = null;
            if (updatePayload !== null) {
              commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
            }
          }
          return;
        }
      case HostText:
        {
          invariant(finishedWork.stateNode !== null && current !== null, 'This should only be done during updates. This error is likely ' + 'caused by a bug in React. Please file an issue.');
          var textInstance = finishedWork.stateNode;
          var newText = finishedWork.memoizedProps;
          var oldText = current.memoizedProps;
          commitTextUpdate(textInstance, oldText, newText);
          return;
        }
      case HostRoot:
        {
          return;
        }
      case HostPortal:
        {
          return;
        }
      default:
        {
          invariant(false, 'This unit of work tag should not have side-effects. This error is ' + 'likely caused by a bug in React. Please file an issue.');
        }
    }
  }

  function commitLifeCycles(current, finishedWork) {
    switch (finishedWork.tag) {
      case ClassComponent:
        {
          var instance = finishedWork.stateNode;
          if (finishedWork.effectTag & Update) {
            if (current === null) {
              if (__DEV__) {
                startPhaseTimer(finishedWork, 'componentDidMount');
              }
              instance.componentDidMount();
              if (__DEV__) {
                stopPhaseTimer();
              }
            } else {
              var prevProps = current.memoizedProps;
              var prevState = current.memoizedState;
              if (__DEV__) {
                startPhaseTimer(finishedWork, 'componentDidUpdate');
              }
              instance.componentDidUpdate(prevProps, prevState);
              if (__DEV__) {
                stopPhaseTimer();
              }
            }
          }
          if (finishedWork.effectTag & Callback && finishedWork.updateQueue !== null) {
            commitCallbacks(finishedWork, finishedWork.updateQueue, instance);
          }
          return;
        }
      case HostRoot:
        {
          var updateQueue = finishedWork.updateQueue;
          if (updateQueue !== null) {
            var _instance = finishedWork.child && finishedWork.child.stateNode;
            commitCallbacks(finishedWork, updateQueue, _instance);
          }
          return;
        }
      case HostComponent:
        {
          var _instance2 = finishedWork.stateNode;

          if (current === null && finishedWork.effectTag & Update) {
            var type = finishedWork.type;
            var props = finishedWork.memoizedProps;
            commitMount(_instance2, type, props, finishedWork);
          }

          return;
        }
      case HostText:
        {
          return;
        }
      case HostPortal:
        {
          return;
        }
      default:
        {
          invariant(false, 'This unit of work tag should not have side-effects. This error is ' + 'likely caused by a bug in React. Please file an issue.');
        }
    }
  }

  function commitAttachRef(finishedWork) {
    var ref = finishedWork.ref;
    if (ref !== null) {
      var instance = getPublicInstance(finishedWork.stateNode);
      ref(instance);
    }
  }

  function commitDetachRef(current) {
    var currentRef = current.ref;
    if (currentRef !== null) {
      currentRef(null);
    }
  }

  return {
    commitPlacement: commitPlacement,
    commitDeletion: commitDeletion,
    commitWork: commitWork,
    commitLifeCycles: commitLifeCycles,
    commitAttachRef: commitAttachRef,
    commitDetachRef: commitDetachRef
  };
};