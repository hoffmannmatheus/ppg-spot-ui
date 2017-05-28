

'use strict';

var ReactControlledComponent = require('ReactControlledComponent');

var stackBatchedUpdates = function stackBatchedUpdates(fn, a, b, c, d, e) {
  return fn(a, b, c, d, e);
};
var fiberBatchedUpdates = function fiberBatchedUpdates(fn, bookkeeping) {
  return fn(bookkeeping);
};

function performFiberBatchedUpdates(fn, bookkeeping) {
  return fiberBatchedUpdates(fn, bookkeeping);
}
function batchedUpdates(fn, bookkeeping) {
  return stackBatchedUpdates(performFiberBatchedUpdates, fn, bookkeeping);
}

var isNestingBatched = false;
function batchedUpdatesWithControlledComponents(fn, bookkeeping) {
  if (isNestingBatched) {
    return batchedUpdates(fn, bookkeeping);
  }
  isNestingBatched = true;
  try {
    return batchedUpdates(fn, bookkeeping);
  } finally {
    isNestingBatched = false;
    ReactControlledComponent.restoreStateIfNeeded();
  }
}

var ReactGenericBatchingInjection = {
  injectStackBatchedUpdates: function injectStackBatchedUpdates(_batchedUpdates) {
    stackBatchedUpdates = _batchedUpdates;
  },
  injectFiberBatchedUpdates: function injectFiberBatchedUpdates(_batchedUpdates) {
    fiberBatchedUpdates = _batchedUpdates;
  }
};

var ReactGenericBatching = {
  batchedUpdates: batchedUpdatesWithControlledComponents,
  injection: ReactGenericBatchingInjection
};

module.exports = ReactGenericBatching;