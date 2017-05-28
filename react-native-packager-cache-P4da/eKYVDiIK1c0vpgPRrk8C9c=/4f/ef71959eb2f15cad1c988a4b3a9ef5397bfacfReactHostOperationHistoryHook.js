

'use strict';

var ReactHostOperationHistoryHook = null;

if (__DEV__) {
  var history = [];

  ReactHostOperationHistoryHook = {
    onHostOperation: function onHostOperation(operation) {
      history.push(operation);
    },
    clearHistory: function clearHistory() {
      if (ReactHostOperationHistoryHook._preventClearing) {
        return;
      }

      history = [];
    },
    getHistory: function getHistory() {
      return history;
    }
  };
}

module.exports = ReactHostOperationHistoryHook;