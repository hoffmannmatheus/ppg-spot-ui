

'use strict';

var _require = require('ReactFiberContext'),
    popContextProvider = _require.popContextProvider;

var _require2 = require('ReactFiberStack'),
    reset = _require2.reset;

var _require3 = require('ReactFiberComponentTreeHook'),
    getStackAddendumByWorkInProgressFiber = _require3.getStackAddendumByWorkInProgressFiber;

var _require4 = require('ReactFiberErrorLogger'),
    logCapturedError = _require4.logCapturedError;

var _require5 = require('ReactErrorUtils'),
    invokeGuardedCallback = _require5.invokeGuardedCallback;

var ReactFiberBeginWork = require('ReactFiberBeginWork');
var ReactFiberCompleteWork = require('ReactFiberCompleteWork');
var ReactFiberCommitWork = require('ReactFiberCommitWork');
var ReactFiberHostContext = require('ReactFiberHostContext');
var ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
var ReactFeatureFlags = require('ReactFeatureFlags');
var getComponentName = require('getComponentName');

var _require6 = require('ReactFiber'),
    cloneFiber = _require6.cloneFiber;

var _require7 = require('ReactFiberDevToolsHook'),
    onCommitRoot = _require7.onCommitRoot;

var _require8 = require('ReactPriorityLevel'),
    NoWork = _require8.NoWork,
    SynchronousPriority = _require8.SynchronousPriority,
    TaskPriority = _require8.TaskPriority,
    AnimationPriority = _require8.AnimationPriority,
    HighPriority = _require8.HighPriority,
    LowPriority = _require8.LowPriority,
    OffscreenPriority = _require8.OffscreenPriority;

var _require9 = require('ReactTypeOfSideEffect'),
    NoEffect = _require9.NoEffect,
    Placement = _require9.Placement,
    Update = _require9.Update,
    PlacementAndUpdate = _require9.PlacementAndUpdate,
    Deletion = _require9.Deletion,
    ContentReset = _require9.ContentReset,
    Callback = _require9.Callback,
    Err = _require9.Err,
    Ref = _require9.Ref;

var _require10 = require('ReactTypeOfWork'),
    HostRoot = _require10.HostRoot,
    HostComponent = _require10.HostComponent,
    HostPortal = _require10.HostPortal,
    ClassComponent = _require10.ClassComponent;

var _require11 = require('ReactFiberUpdateQueue'),
    getPendingPriority = _require11.getPendingPriority;

var _require12 = require('ReactFiberContext'),
    resetContext = _require12.resetContext;

var invariant = require('fbjs/lib/invariant');

if (__DEV__) {
  var warning = require('fbjs/lib/warning');
  var ReactFiberInstrumentation = require('ReactFiberInstrumentation');
  var ReactDebugCurrentFiber = require('ReactDebugCurrentFiber');

  var _require13 = require('ReactDebugFiberPerf'),
      recordEffect = _require13.recordEffect,
      recordScheduleUpdate = _require13.recordScheduleUpdate,
      startWorkTimer = _require13.startWorkTimer,
      stopWorkTimer = _require13.stopWorkTimer,
      startWorkLoopTimer = _require13.startWorkLoopTimer,
      stopWorkLoopTimer = _require13.stopWorkLoopTimer,
      startCommitTimer = _require13.startCommitTimer,
      stopCommitTimer = _require13.stopCommitTimer,
      startCommitHostEffectsTimer = _require13.startCommitHostEffectsTimer,
      stopCommitHostEffectsTimer = _require13.stopCommitHostEffectsTimer,
      startCommitLifeCyclesTimer = _require13.startCommitLifeCyclesTimer,
      stopCommitLifeCyclesTimer = _require13.stopCommitLifeCyclesTimer;

  var warnAboutUpdateOnUnmounted = function warnAboutUpdateOnUnmounted(instance) {
    var ctor = instance.constructor;
    warning(false, 'Can only update a mounted or mounting component. This usually means ' + 'you called setState, replaceState, or forceUpdate on an unmounted ' + 'component. This is a no-op.\n\nPlease check the code for the ' + '%s component.', ctor && (ctor.displayName || ctor.name) || 'ReactClass');
  };

  var warnAboutInvalidUpdates = function warnAboutInvalidUpdates(instance) {
    switch (ReactDebugCurrentFiber.phase) {
      case 'getChildContext':
        warning(false, 'setState(...): Cannot call setState() inside getChildContext()');
        break;
      case 'render':
        warning(false, 'Cannot update during an existing state transition (such as within ' + "`render` or another component's constructor). Render methods should " + 'be a pure function of props and state; constructor side-effects are ' + 'an anti-pattern, but can be moved to `componentWillMount`.');
        break;
    }
  };
}

var timeHeuristicForUnitOfWork = 1;

module.exports = function (config) {
  var hostContext = ReactFiberHostContext(config);
  var popHostContainer = hostContext.popHostContainer,
      popHostContext = hostContext.popHostContext,
      resetHostContainer = hostContext.resetHostContainer;

  var _ReactFiberBeginWork = ReactFiberBeginWork(config, hostContext, scheduleUpdate, getPriorityContext),
      beginWork = _ReactFiberBeginWork.beginWork,
      beginFailedWork = _ReactFiberBeginWork.beginFailedWork;

  var _ReactFiberCompleteWo = ReactFiberCompleteWork(config, hostContext),
      completeWork = _ReactFiberCompleteWo.completeWork;

  var _ReactFiberCommitWork = ReactFiberCommitWork(config, captureError),
      commitPlacement = _ReactFiberCommitWork.commitPlacement,
      commitDeletion = _ReactFiberCommitWork.commitDeletion,
      commitWork = _ReactFiberCommitWork.commitWork,
      commitLifeCycles = _ReactFiberCommitWork.commitLifeCycles,
      commitAttachRef = _ReactFiberCommitWork.commitAttachRef,
      commitDetachRef = _ReactFiberCommitWork.commitDetachRef;

  var hostScheduleAnimationCallback = config.scheduleAnimationCallback,
      hostScheduleDeferredCallback = config.scheduleDeferredCallback,
      useSyncScheduling = config.useSyncScheduling,
      prepareForCommit = config.prepareForCommit,
      resetAfterCommit = config.resetAfterCommit;

  var priorityContext = useSyncScheduling ? SynchronousPriority : LowPriority;

  var priorityContextBeforeReconciliation = NoWork;

  var isPerformingWork = false;

  var deadlineHasExpired = false;

  var isBatchingUpdates = false;

  var nextUnitOfWork = null;
  var nextPriorityLevel = NoWork;

  var nextEffect = null;

  var pendingCommit = null;

  var nextScheduledRoot = null;
  var lastScheduledRoot = null;

  var isAnimationCallbackScheduled = false;
  var isDeferredCallbackScheduled = false;

  var capturedErrors = null;

  var failedBoundaries = null;

  var commitPhaseBoundaries = null;
  var firstUncaughtError = null;
  var fatalError = null;

  var isCommitting = false;
  var isUnmounting = false;

  function scheduleAnimationCallback(callback) {
    if (!isAnimationCallbackScheduled) {
      isAnimationCallbackScheduled = true;
      hostScheduleAnimationCallback(callback);
    }
  }

  function scheduleDeferredCallback(callback) {
    if (!isDeferredCallbackScheduled) {
      isDeferredCallbackScheduled = true;
      hostScheduleDeferredCallback(callback);
    }
  }

  function resetContextStack() {
    reset();

    resetContext();
    resetHostContainer();
  }

  function findNextUnitOfWork() {
    while (nextScheduledRoot !== null && nextScheduledRoot.current.pendingWorkPriority === NoWork) {
      nextScheduledRoot.isScheduled = false;

      var next = nextScheduledRoot.nextScheduledRoot;
      nextScheduledRoot.nextScheduledRoot = null;

      if (nextScheduledRoot === lastScheduledRoot) {
        nextScheduledRoot = null;
        lastScheduledRoot = null;
        nextPriorityLevel = NoWork;
        return null;
      }

      nextScheduledRoot = next;
    }

    var root = nextScheduledRoot;
    var highestPriorityRoot = null;
    var highestPriorityLevel = NoWork;
    while (root !== null) {
      if (root.current.pendingWorkPriority !== NoWork && (highestPriorityLevel === NoWork || highestPriorityLevel > root.current.pendingWorkPriority)) {
        highestPriorityLevel = root.current.pendingWorkPriority;
        highestPriorityRoot = root;
      }

      root = root.nextScheduledRoot;
    }
    if (highestPriorityRoot !== null) {
      nextPriorityLevel = highestPriorityLevel;
      priorityContext = nextPriorityLevel;

      resetContextStack();

      return cloneFiber(highestPriorityRoot.current, highestPriorityLevel);
    }

    nextPriorityLevel = NoWork;
    return null;
  }

  function commitAllHostEffects() {
    while (nextEffect !== null) {
      if (__DEV__) {
        ReactDebugCurrentFiber.current = nextEffect;
        recordEffect();
      }

      var effectTag = nextEffect.effectTag;
      if (effectTag & ContentReset) {
        config.resetTextContent(nextEffect.stateNode);
      }

      if (effectTag & Ref) {
        var current = nextEffect.alternate;
        if (current !== null) {
          commitDetachRef(current);
        }
      }

      var primaryEffectTag = effectTag & ~(Callback | Err | ContentReset | Ref);
      switch (primaryEffectTag) {
        case Placement:
          {
            commitPlacement(nextEffect);

            nextEffect.effectTag &= ~Placement;
            break;
          }
        case PlacementAndUpdate:
          {
            commitPlacement(nextEffect);

            nextEffect.effectTag &= ~Placement;

            var _current = nextEffect.alternate;
            commitWork(_current, nextEffect);
            break;
          }
        case Update:
          {
            var _current2 = nextEffect.alternate;
            commitWork(_current2, nextEffect);
            break;
          }
        case Deletion:
          {
            isUnmounting = true;
            commitDeletion(nextEffect);
            isUnmounting = false;
            break;
          }
      }
      nextEffect = nextEffect.nextEffect;
    }

    if (__DEV__) {
      ReactDebugCurrentFiber.current = null;
    }
  }

  function commitAllLifeCycles() {
    while (nextEffect !== null) {
      var effectTag = nextEffect.effectTag;

      if (effectTag & (Update | Callback)) {
        if (__DEV__) {
          recordEffect();
        }
        var current = nextEffect.alternate;
        commitLifeCycles(current, nextEffect);
      }

      if (effectTag & Ref) {
        if (__DEV__) {
          recordEffect();
        }
        commitAttachRef(nextEffect);
      }

      if (effectTag & Err) {
        if (__DEV__) {
          recordEffect();
        }
        commitErrorHandling(nextEffect);
      }

      var next = nextEffect.nextEffect;

      nextEffect.nextEffect = null;

      nextEffect = next;
    }
  }

  function commitAllWork(finishedWork) {
    isCommitting = true;
    if (__DEV__) {
      startCommitTimer();
    }

    pendingCommit = null;
    var root = finishedWork.stateNode;
    invariant(root.current !== finishedWork, 'Cannot commit the same tree as before. This is probably a bug ' + 'related to the return field. This error is likely caused by a bug ' + 'in React. Please file an issue.');

    ReactCurrentOwner.current = null;

    var previousPriorityContext = priorityContext;
    priorityContext = TaskPriority;

    var firstEffect = void 0;
    if (finishedWork.effectTag !== NoEffect) {
      if (finishedWork.lastEffect !== null) {
        finishedWork.lastEffect.nextEffect = finishedWork;
        firstEffect = finishedWork.firstEffect;
      } else {
        firstEffect = finishedWork;
      }
    } else {
      firstEffect = finishedWork.firstEffect;
    }

    var commitInfo = prepareForCommit();

    nextEffect = firstEffect;
    if (__DEV__) {
      startCommitHostEffectsTimer();
    }
    while (nextEffect !== null) {
      var _error = null;
      if (__DEV__) {
        _error = invokeGuardedCallback(null, commitAllHostEffects, null, finishedWork);
      } else {
        try {
          commitAllHostEffects(finishedWork);
        } catch (e) {
          _error = e;
        }
      }
      if (_error !== null) {
        invariant(nextEffect !== null, 'Should have next effect. This error is likely caused by a bug ' + 'in React. Please file an issue.');
        captureError(nextEffect, _error);

        if (nextEffect !== null) {
          nextEffect = nextEffect.nextEffect;
        }
      }
    }
    if (__DEV__) {
      stopCommitHostEffectsTimer();
    }

    resetAfterCommit(commitInfo);

    root.current = finishedWork;

    nextEffect = firstEffect;
    if (__DEV__) {
      startCommitLifeCyclesTimer();
    }
    while (nextEffect !== null) {
      var _error2 = null;
      if (__DEV__) {
        _error2 = invokeGuardedCallback(null, commitAllLifeCycles, null, finishedWork);
      } else {
        try {
          commitAllLifeCycles(finishedWork);
        } catch (e) {
          _error2 = e;
        }
      }
      if (_error2 !== null) {
        invariant(nextEffect !== null, 'Should have next effect. This error is likely caused by a bug ' + 'in React. Please file an issue.');
        captureError(nextEffect, _error2);
        if (nextEffect !== null) {
          nextEffect = nextEffect.nextEffect;
        }
      }
    }

    isCommitting = false;
    if (__DEV__) {
      stopCommitLifeCyclesTimer();
      stopCommitTimer();
    }
    if (typeof onCommitRoot === 'function') {
      onCommitRoot(finishedWork.stateNode);
    }
    if (__DEV__ && ReactFiberInstrumentation.debugTool) {
      ReactFiberInstrumentation.debugTool.onCommitWork(finishedWork);
    }

    if (commitPhaseBoundaries) {
      commitPhaseBoundaries.forEach(scheduleErrorRecovery);
      commitPhaseBoundaries = null;
    }

    priorityContext = previousPriorityContext;
  }

  function resetWorkPriority(workInProgress) {
    var newPriority = NoWork;

    var queue = workInProgress.updateQueue;
    var tag = workInProgress.tag;
    if (queue !== null && (tag === ClassComponent || tag === HostRoot)) {
      newPriority = getPendingPriority(queue);
    }

    var child = workInProgress.progressedChild;
    while (child !== null) {
      if (child.pendingWorkPriority !== NoWork && (newPriority === NoWork || newPriority > child.pendingWorkPriority)) {
        newPriority = child.pendingWorkPriority;
      }
      child = child.sibling;
    }
    workInProgress.pendingWorkPriority = newPriority;
  }

  function completeUnitOfWork(workInProgress) {
    while (true) {
      var current = workInProgress.alternate;
      var next = completeWork(current, workInProgress);

      var returnFiber = workInProgress.return;
      var siblingFiber = workInProgress.sibling;

      resetWorkPriority(workInProgress);

      if (next !== null) {
        if (__DEV__) {
          stopWorkTimer(workInProgress);
        }
        if (__DEV__ && ReactFiberInstrumentation.debugTool) {
          ReactFiberInstrumentation.debugTool.onCompleteWork(workInProgress);
        }

        return next;
      }

      if (returnFiber !== null) {
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = workInProgress.firstEffect;
        }
        if (workInProgress.lastEffect !== null) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
          }
          returnFiber.lastEffect = workInProgress.lastEffect;
        }

        if (workInProgress.effectTag !== NoEffect) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress;
          } else {
            returnFiber.firstEffect = workInProgress;
          }
          returnFiber.lastEffect = workInProgress;
        }
      }

      if (__DEV__) {
        stopWorkTimer(workInProgress);
      }
      if (__DEV__ && ReactFiberInstrumentation.debugTool) {
        ReactFiberInstrumentation.debugTool.onCompleteWork(workInProgress);
      }

      if (siblingFiber !== null) {
        return siblingFiber;
      } else if (returnFiber !== null) {
        workInProgress = returnFiber;
        continue;
      } else {
        if (nextPriorityLevel < HighPriority) {
          commitAllWork(workInProgress);
        } else {
          pendingCommit = workInProgress;
        }
        return null;
      }
    }

    return null;
  }

  function performUnitOfWork(workInProgress) {
    var current = workInProgress.alternate;

    if (__DEV__) {
      startWorkTimer(workInProgress);
    }
    var next = beginWork(current, workInProgress, nextPriorityLevel);
    if (__DEV__ && ReactFiberInstrumentation.debugTool) {
      ReactFiberInstrumentation.debugTool.onBeginWork(workInProgress);
    }

    if (next === null) {
      next = completeUnitOfWork(workInProgress);
    }

    ReactCurrentOwner.current = null;
    if (__DEV__) {
      ReactDebugCurrentFiber.current = null;
    }

    return next;
  }

  function performFailedUnitOfWork(workInProgress) {
    var current = workInProgress.alternate;

    if (__DEV__) {
      startWorkTimer(workInProgress);
    }
    var next = beginFailedWork(current, workInProgress, nextPriorityLevel);
    if (__DEV__ && ReactFiberInstrumentation.debugTool) {
      ReactFiberInstrumentation.debugTool.onBeginWork(workInProgress);
    }

    if (next === null) {
      next = completeUnitOfWork(workInProgress);
    }

    ReactCurrentOwner.current = null;
    if (__DEV__) {
      ReactDebugCurrentFiber.current = null;
    }

    return next;
  }

  function performDeferredWork(deadline) {
    isDeferredCallbackScheduled = false;
    performWork(OffscreenPriority, deadline);
  }

  function performAnimationWork() {
    isAnimationCallbackScheduled = false;
    performWork(AnimationPriority, null);
  }

  function clearErrors() {
    if (nextUnitOfWork === null) {
      nextUnitOfWork = findNextUnitOfWork();
    }

    while (capturedErrors !== null && capturedErrors.size && nextUnitOfWork !== null && nextPriorityLevel !== NoWork && nextPriorityLevel <= TaskPriority) {
      if (hasCapturedError(nextUnitOfWork)) {
        nextUnitOfWork = performFailedUnitOfWork(nextUnitOfWork);
      } else {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      }
      if (nextUnitOfWork === null) {
        nextUnitOfWork = findNextUnitOfWork();
      }
    }
  }

  function workLoop(priorityLevel, deadline) {
    clearErrors();

    if (nextUnitOfWork === null) {
      nextUnitOfWork = findNextUnitOfWork();
    }

    var hostRootTimeMarker = void 0;
    if (ReactFeatureFlags.logTopLevelRenders && nextUnitOfWork !== null && nextUnitOfWork.tag === HostRoot && nextUnitOfWork.child !== null) {
      var _componentName = getComponentName(nextUnitOfWork.child) || '';
      hostRootTimeMarker = 'React update: ' + _componentName;
      console.time(hostRootTimeMarker);
    }

    if (deadline !== null && priorityLevel > TaskPriority) {
      while (nextUnitOfWork !== null && !deadlineHasExpired) {
        if (deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
          nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

          if (nextUnitOfWork === null && pendingCommit !== null) {
            if (deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
              commitAllWork(pendingCommit);
              nextUnitOfWork = findNextUnitOfWork();

              clearErrors();
            } else {
              deadlineHasExpired = true;
            }
          }
        } else {
          deadlineHasExpired = true;
        }
      }
    } else {
      while (nextUnitOfWork !== null && nextPriorityLevel !== NoWork && nextPriorityLevel <= priorityLevel) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        if (nextUnitOfWork === null) {
          nextUnitOfWork = findNextUnitOfWork();

          clearErrors();
        }
      }
    }

    if (hostRootTimeMarker) {
      console.timeEnd(hostRootTimeMarker);
    }
  }

  function performWork(priorityLevel, deadline) {
    if (__DEV__) {
      startWorkLoopTimer();
    }

    invariant(!isPerformingWork, 'performWork was called recursively. This error is likely caused ' + 'by a bug in React. Please file an issue.');
    isPerformingWork = true;
    var isPerformingDeferredWork = !!deadline;

    while (priorityLevel !== NoWork && !fatalError) {
      invariant(deadline !== null || priorityLevel < HighPriority, 'Cannot perform deferred work without a deadline. This error is ' + 'likely caused by a bug in React. Please file an issue.');

      if (pendingCommit !== null && !deadlineHasExpired) {
        commitAllWork(pendingCommit);
      }

      priorityContextBeforeReconciliation = priorityContext;
      var _error3 = null;
      if (__DEV__) {
        _error3 = invokeGuardedCallback(null, workLoop, null, priorityLevel, deadline);
      } else {
        try {
          workLoop(priorityLevel, deadline);
        } catch (e) {
          _error3 = e;
        }
      }

      priorityContext = priorityContextBeforeReconciliation;

      if (_error3 !== null) {
        var failedWork = nextUnitOfWork;

        if (failedWork !== null) {
          var maybeBoundary = captureError(failedWork, _error3);
          if (maybeBoundary !== null) {
            var boundary = maybeBoundary;

            beginFailedWork(boundary.alternate, boundary, priorityLevel);

            unwindContexts(failedWork, boundary);
            nextUnitOfWork = completeUnitOfWork(boundary);
          }

          continue;
        } else if (fatalError === null) {
          fatalError = _error3;
        }
      }

      priorityLevel = NoWork;

      if (nextPriorityLevel !== NoWork && isPerformingDeferredWork && !deadlineHasExpired) {
        priorityLevel = nextPriorityLevel;
        continue;
      }

      switch (nextPriorityLevel) {
        case SynchronousPriority:
        case TaskPriority:
          priorityLevel = nextPriorityLevel;
          break;
        case AnimationPriority:
          scheduleAnimationCallback(performAnimationWork);

          scheduleDeferredCallback(performDeferredWork);
          break;
        case HighPriority:
        case LowPriority:
        case OffscreenPriority:
          scheduleDeferredCallback(performDeferredWork);
          break;
      }
    }

    var errorToThrow = fatalError || firstUncaughtError;

    isPerformingWork = false;
    deadlineHasExpired = false;
    fatalError = null;
    firstUncaughtError = null;
    capturedErrors = null;
    failedBoundaries = null;
    if (__DEV__) {
      stopWorkLoopTimer();
    }

    if (errorToThrow !== null) {
      throw errorToThrow;
    }
  }

  function captureError(failedWork, error) {
    ReactCurrentOwner.current = null;
    if (__DEV__) {
      ReactDebugCurrentFiber.current = null;
      ReactDebugCurrentFiber.phase = null;
    }

    nextUnitOfWork = null;

    var boundary = null;

    var errorBoundaryFound = false;
    var willRetry = false;
    var errorBoundaryName = null;

    if (failedWork.tag === HostRoot) {
      boundary = failedWork;

      if (isFailedBoundary(failedWork)) {
        fatalError = error;
      }
    } else {
      var node = failedWork.return;
      while (node !== null && boundary === null) {
        if (node.tag === ClassComponent) {
          var instance = node.stateNode;
          if (typeof instance.unstable_handleError === 'function') {
            errorBoundaryFound = true;
            errorBoundaryName = getComponentName(node);

            boundary = node;
            willRetry = true;
          }
        } else if (node.tag === HostRoot) {
          boundary = node;
        }

        if (isFailedBoundary(node)) {
          if (isUnmounting) {
            return null;
          }

          if (commitPhaseBoundaries !== null && (commitPhaseBoundaries.has(node) || node.alternate !== null && commitPhaseBoundaries.has(node.alternate))) {
            return null;
          }

          boundary = null;
          willRetry = false;
        }

        node = node.return;
      }
    }

    if (boundary !== null) {
      if (failedBoundaries === null) {
        failedBoundaries = new Set();
      }
      failedBoundaries.add(boundary);

      var _componentStack = getStackAddendumByWorkInProgressFiber(failedWork);
      var _componentName2 = getComponentName(failedWork);

      if (capturedErrors === null) {
        capturedErrors = new Map();
      }
      capturedErrors.set(boundary, {
        componentName: _componentName2,
        componentStack: _componentStack,
        error: error,
        errorBoundary: errorBoundaryFound ? boundary.stateNode : null,
        errorBoundaryFound: errorBoundaryFound,
        errorBoundaryName: errorBoundaryName,
        willRetry: willRetry
      });

      if (isCommitting) {
        if (commitPhaseBoundaries === null) {
          commitPhaseBoundaries = new Set();
        }
        commitPhaseBoundaries.add(boundary);
      } else {
        scheduleErrorRecovery(boundary);
      }
      return boundary;
    } else if (firstUncaughtError === null) {
      firstUncaughtError = error;
    }
    return null;
  }

  function hasCapturedError(fiber) {
    return capturedErrors !== null && (capturedErrors.has(fiber) || fiber.alternate !== null && capturedErrors.has(fiber.alternate));
  }

  function isFailedBoundary(fiber) {
    return failedBoundaries !== null && (failedBoundaries.has(fiber) || fiber.alternate !== null && failedBoundaries.has(fiber.alternate));
  }

  function commitErrorHandling(effectfulFiber) {
    var capturedError = void 0;
    if (capturedErrors !== null) {
      capturedError = capturedErrors.get(effectfulFiber);
      capturedErrors.delete(effectfulFiber);
      if (capturedError == null) {
        if (effectfulFiber.alternate !== null) {
          effectfulFiber = effectfulFiber.alternate;
          capturedError = capturedErrors.get(effectfulFiber);
          capturedErrors.delete(effectfulFiber);
        }
      }
    }

    invariant(capturedError != null, 'No error for given unit of work. This error is likely caused by a ' + 'bug in React. Please file an issue.');

    var error = capturedError.error;
    try {
      logCapturedError(capturedError);
    } catch (e) {
      console.error(e);
    }

    switch (effectfulFiber.tag) {
      case ClassComponent:
        var instance = effectfulFiber.stateNode;

        var info = {
          componentStack: capturedError.componentStack
        };

        instance.unstable_handleError(error, info);
        return;
      case HostRoot:
        if (firstUncaughtError === null) {
          firstUncaughtError = error;
        }
        return;
      default:
        invariant(false, 'Invalid type of work. This error is likely caused by a bug in ' + 'React. Please file an issue.');
    }
  }

  function unwindContexts(from, to) {
    var node = from;
    while (node !== null && node !== to && node.alternate !== to) {
      switch (node.tag) {
        case ClassComponent:
          popContextProvider(node);
          break;
        case HostComponent:
          popHostContext(node);
          break;
        case HostRoot:
          popHostContainer(node);
          break;
        case HostPortal:
          popHostContainer(node);
          break;
      }
      if (__DEV__) {
        stopWorkTimer(node);
      }
      node = node.return;
    }
  }

  function scheduleRoot(root, priorityLevel) {
    if (priorityLevel === NoWork) {
      return;
    }

    if (!root.isScheduled) {
      root.isScheduled = true;
      if (lastScheduledRoot) {
        lastScheduledRoot.nextScheduledRoot = root;
        lastScheduledRoot = root;
      } else {
        nextScheduledRoot = root;
        lastScheduledRoot = root;
      }
    }
  }

  function scheduleUpdate(fiber, priorityLevel) {
    if (__DEV__) {
      recordScheduleUpdate();
    }

    if (priorityLevel <= nextPriorityLevel) {
      nextUnitOfWork = null;
    }

    if (__DEV__) {
      if (fiber.tag === ClassComponent) {
        var instance = fiber.stateNode;
        warnAboutInvalidUpdates(instance);
      }
    }

    var node = fiber;
    var shouldContinue = true;
    while (node !== null && shouldContinue) {
      shouldContinue = false;
      if (node.pendingWorkPriority === NoWork || node.pendingWorkPriority > priorityLevel) {
        shouldContinue = true;
        node.pendingWorkPriority = priorityLevel;
      }
      if (node.alternate !== null) {
        if (node.alternate.pendingWorkPriority === NoWork || node.alternate.pendingWorkPriority > priorityLevel) {
          shouldContinue = true;
          node.alternate.pendingWorkPriority = priorityLevel;
        }
      }
      if (node.return === null) {
        if (node.tag === HostRoot) {
          var root = node.stateNode;
          scheduleRoot(root, priorityLevel);

          switch (priorityLevel) {
            case SynchronousPriority:
              performWork(SynchronousPriority, null);
              return;
            case TaskPriority:
              return;
            case AnimationPriority:
              scheduleAnimationCallback(performAnimationWork);
              return;
            case HighPriority:
            case LowPriority:
            case OffscreenPriority:
              scheduleDeferredCallback(performDeferredWork);
              return;
          }
        } else {
          if (__DEV__) {
            if (fiber.tag === ClassComponent) {
              warnAboutUpdateOnUnmounted(fiber.stateNode);
            }
          }
          return;
        }
      }
      node = node.return;
    }
  }

  function getPriorityContext() {
    if (priorityContext === SynchronousPriority && (isPerformingWork || isBatchingUpdates)) {
      return TaskPriority;
    }
    return priorityContext;
  }

  function scheduleErrorRecovery(fiber) {
    scheduleUpdate(fiber, TaskPriority);
  }

  function performWithPriority(priorityLevel, fn) {
    var previousPriorityContext = priorityContext;
    priorityContext = priorityLevel;
    try {
      fn();
    } finally {
      priorityContext = previousPriorityContext;
    }
  }

  function batchedUpdates(fn, a) {
    var previousIsBatchingUpdates = isBatchingUpdates;
    isBatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isBatchingUpdates = previousIsBatchingUpdates;

      if (!isPerformingWork && !isBatchingUpdates) {
        performWork(TaskPriority, null);
      }
    }
  }

  function unbatchedUpdates(fn) {
    var previousIsBatchingUpdates = isBatchingUpdates;
    isBatchingUpdates = false;
    try {
      return fn();
    } finally {
      isBatchingUpdates = previousIsBatchingUpdates;
    }
  }

  function syncUpdates(fn) {
    var previousPriorityContext = priorityContext;
    priorityContext = SynchronousPriority;
    try {
      return fn();
    } finally {
      priorityContext = previousPriorityContext;
    }
  }

  function deferredUpdates(fn) {
    var previousPriorityContext = priorityContext;
    priorityContext = LowPriority;
    try {
      return fn();
    } finally {
      priorityContext = previousPriorityContext;
    }
  }

  return {
    scheduleUpdate: scheduleUpdate,
    getPriorityContext: getPriorityContext,
    performWithPriority: performWithPriority,
    batchedUpdates: batchedUpdates,
    unbatchedUpdates: unbatchedUpdates,
    syncUpdates: syncUpdates,
    deferredUpdates: deferredUpdates
  };
};