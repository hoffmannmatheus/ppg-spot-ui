
var ReactDebugFiberPerf = null;

if (__DEV__) {
  var _require = require('ReactTypeOfWork'),
      HostRoot = _require.HostRoot,
      HostComponent = _require.HostComponent,
      HostText = _require.HostText,
      HostPortal = _require.HostPortal,
      YieldComponent = _require.YieldComponent,
      Fragment = _require.Fragment;

  var getComponentName = require('getComponentName');

  var reactEmoji = '\u269B';
  var warningEmoji = '\u26D4';
  var supportsUserTiming = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';

  var currentFiber = null;

  var currentPhase = null;
  var currentPhaseFiber = null;

  var isCommitting = false;
  var hasScheduledUpdateInCurrentCommit = false;
  var hasScheduledUpdateInCurrentPhase = false;
  var commitCountInCurrentWorkLoop = 0;
  var effectCountInCurrentCommit = 0;

  var labelsInCurrentCommit = new Set();

  var formatMarkName = function formatMarkName(markName) {
    return reactEmoji + ' ' + markName;
  };

  var formatLabel = function formatLabel(label, warning) {
    var prefix = warning ? warningEmoji + ' ' : reactEmoji + ' ';
    var suffix = warning ? ' Warning: ' + warning : '';
    return '' + prefix + label + suffix;
  };

  var beginMark = function beginMark(markName) {
    performance.mark(formatMarkName(markName));
  };

  var clearMark = function clearMark(markName) {
    performance.clearMarks(formatMarkName(markName));
  };

  var endMark = function endMark(label, markName, warning) {
    var formattedMarkName = formatMarkName(markName);
    var formattedLabel = formatLabel(label, warning);
    try {
      performance.measure(formattedLabel, formattedMarkName);
    } catch (err) {}

    performance.clearMarks(formattedMarkName);
    performance.clearMeasures(formattedLabel);
  };

  var getFiberMarkName = function getFiberMarkName(label, debugID) {
    return label + ' (#' + debugID + ')';
  };

  var getFiberLabel = function getFiberLabel(componentName, isMounted, phase) {
    if (phase === null) {
      return componentName + ' [' + (isMounted ? 'update' : 'mount') + ']';
    } else {
      return componentName + '.' + phase;
    }
  };

  var beginFiberMark = function beginFiberMark(fiber, phase) {
    var componentName = getComponentName(fiber) || 'Unknown';
    var debugID = fiber._debugID;
    var isMounted = fiber.alternate !== null;
    var label = getFiberLabel(componentName, isMounted, phase);

    if (isCommitting && labelsInCurrentCommit.has(label)) {
      return false;
    }
    labelsInCurrentCommit.add(label);

    var markName = getFiberMarkName(label, debugID);
    beginMark(markName);
    return true;
  };

  var clearFiberMark = function clearFiberMark(fiber, phase) {
    var componentName = getComponentName(fiber) || 'Unknown';
    var debugID = fiber._debugID;
    var isMounted = fiber.alternate !== null;
    var label = getFiberLabel(componentName, isMounted, phase);
    var markName = getFiberMarkName(label, debugID);
    clearMark(markName);
  };

  var endFiberMark = function endFiberMark(fiber, phase, warning) {
    var componentName = getComponentName(fiber) || 'Unknown';
    var debugID = fiber._debugID;
    var isMounted = fiber.alternate !== null;
    var label = getFiberLabel(componentName, isMounted, phase);
    var markName = getFiberMarkName(label, debugID);
    endMark(label, markName, warning);
  };

  var shouldIgnoreFiber = function shouldIgnoreFiber(fiber) {
    switch (fiber.tag) {
      case HostRoot:
      case HostComponent:
      case HostText:
      case HostPortal:
      case YieldComponent:
      case Fragment:
        return true;
      default:
        return false;
    }
  };

  var clearPendingPhaseMeasurement = function clearPendingPhaseMeasurement() {
    if (currentPhase !== null && currentPhaseFiber !== null) {
      clearFiberMark(currentPhaseFiber, currentPhase);
    }
    currentPhaseFiber = null;
    currentPhase = null;
    hasScheduledUpdateInCurrentPhase = false;
  };

  var pauseTimers = function pauseTimers() {
    var fiber = currentFiber;
    while (fiber) {
      if (fiber._debugIsCurrentlyTiming) {
        endFiberMark(fiber, null, null);
      }
      fiber = fiber.return;
    }
  };

  var resumeTimersRecursively = function resumeTimersRecursively(fiber) {
    if (fiber.return !== null) {
      resumeTimersRecursively(fiber.return);
    }
    if (fiber._debugIsCurrentlyTiming) {
      beginFiberMark(fiber, null);
    }
  };

  var resumeTimers = function resumeTimers() {
    if (currentFiber !== null) {
      resumeTimersRecursively(currentFiber);
    }
  };

  ReactDebugFiberPerf = {
    recordEffect: function recordEffect() {
      effectCountInCurrentCommit++;
    },
    recordScheduleUpdate: function recordScheduleUpdate() {
      if (isCommitting) {
        hasScheduledUpdateInCurrentCommit = true;
      }
      if (currentPhase !== null && currentPhase !== 'componentWillMount' && currentPhase !== 'componentWillReceiveProps') {
        hasScheduledUpdateInCurrentPhase = true;
      }
    },
    startWorkTimer: function startWorkTimer(fiber) {
      if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
        return;
      }

      currentFiber = fiber;
      if (!beginFiberMark(fiber, null)) {
        return;
      }
      fiber._debugIsCurrentlyTiming = true;
    },
    cancelWorkTimer: function cancelWorkTimer(fiber) {
      if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
        return;
      }

      fiber._debugIsCurrentlyTiming = false;
      clearFiberMark(fiber, null);
    },
    stopWorkTimer: function stopWorkTimer(fiber) {
      if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
        return;
      }

      currentFiber = fiber.return;
      if (!fiber._debugIsCurrentlyTiming) {
        return;
      }
      fiber._debugIsCurrentlyTiming = false;
      endFiberMark(fiber, null, null);
    },
    startPhaseTimer: function startPhaseTimer(fiber, phase) {
      if (!supportsUserTiming) {
        return;
      }
      clearPendingPhaseMeasurement();
      if (!beginFiberMark(fiber, phase)) {
        return;
      }
      currentPhaseFiber = fiber;
      currentPhase = phase;
    },
    stopPhaseTimer: function stopPhaseTimer() {
      if (!supportsUserTiming) {
        return;
      }
      if (currentPhase !== null && currentPhaseFiber !== null) {
        var warning = hasScheduledUpdateInCurrentPhase ? 'Scheduled a cascading update' : null;
        endFiberMark(currentPhaseFiber, currentPhase, warning);
      }
      currentPhase = null;
      currentPhaseFiber = null;
    },
    startWorkLoopTimer: function startWorkLoopTimer() {
      if (!supportsUserTiming) {
        return;
      }
      commitCountInCurrentWorkLoop = 0;

      beginMark('(React Tree Reconciliation)');

      resumeTimers();
    },
    stopWorkLoopTimer: function stopWorkLoopTimer() {
      if (!supportsUserTiming) {
        return;
      }
      var warning = commitCountInCurrentWorkLoop > 1 ? 'There were cascading updates' : null;
      commitCountInCurrentWorkLoop = 0;

      pauseTimers();
      endMark('(React Tree Reconciliation)', '(React Tree Reconciliation)', warning);
    },
    startCommitTimer: function startCommitTimer() {
      if (!supportsUserTiming) {
        return;
      }
      isCommitting = true;
      hasScheduledUpdateInCurrentCommit = false;
      labelsInCurrentCommit.clear();
      beginMark('(Committing Changes)');
    },
    stopCommitTimer: function stopCommitTimer() {
      if (!supportsUserTiming) {
        return;
      }

      var warning = null;
      if (hasScheduledUpdateInCurrentCommit) {
        warning = 'Lifecycle hook scheduled a cascading update';
      } else if (commitCountInCurrentWorkLoop > 0) {
        warning = 'Caused by a cascading update in earlier commit';
      }
      hasScheduledUpdateInCurrentCommit = false;
      commitCountInCurrentWorkLoop++;
      isCommitting = false;
      labelsInCurrentCommit.clear();

      endMark('(Committing Changes)', '(Committing Changes)', warning);
    },
    startCommitHostEffectsTimer: function startCommitHostEffectsTimer() {
      if (!supportsUserTiming) {
        return;
      }
      effectCountInCurrentCommit = 0;
      beginMark('(Committing Host Effects)');
    },
    stopCommitHostEffectsTimer: function stopCommitHostEffectsTimer() {
      if (!supportsUserTiming) {
        return;
      }
      var count = effectCountInCurrentCommit;
      effectCountInCurrentCommit = 0;
      endMark('(Committing Host Effects: ' + count + ' Total)', '(Committing Host Effects)', null);
    },
    startCommitLifeCyclesTimer: function startCommitLifeCyclesTimer() {
      if (!supportsUserTiming) {
        return;
      }
      effectCountInCurrentCommit = 0;
      beginMark('(Calling Lifecycle Methods)');
    },
    stopCommitLifeCyclesTimer: function stopCommitLifeCyclesTimer() {
      if (!supportsUserTiming) {
        return;
      }
      var count = effectCountInCurrentCommit;
      effectCountInCurrentCommit = 0;
      endMark('(Calling Lifecycle Methods: ' + count + ' Total)', '(Calling Lifecycle Methods)', null);
    }
  };
}

module.exports = ReactDebugFiberPerf;