

'use strict';

var invariant = require('fbjs/lib/invariant');

var defaultShowDialog = function defaultShowDialog() {
  return true;
};

var showDialog = defaultShowDialog;

function logCapturedError(capturedError) {
  var logError = showDialog(capturedError);

  if (logError === false) {
    return;
  }

  if (__DEV__) {
    var componentName = capturedError.componentName,
        componentStack = capturedError.componentStack,
        error = capturedError.error,
        errorBoundaryName = capturedError.errorBoundaryName,
        errorBoundaryFound = capturedError.errorBoundaryFound,
        willRetry = capturedError.willRetry;
    var message = error.message,
        name = error.name,
        stack = error.stack;


    var errorSummary = message ? name + ': ' + message : name;

    var componentNameMessage = componentName ? 'React caught an error thrown by ' + componentName + '.' : 'React caught an error thrown by one of your components.';

    var formattedCallStack = stack.slice(0, errorSummary.length) === errorSummary ? stack.slice(errorSummary.length) : stack;
    formattedCallStack = formattedCallStack.trim().split('\n').map(function (line) {
      return '\n    ' + line.trim();
    }).join();

    var errorBoundaryMessage = void 0;

    if (errorBoundaryFound && errorBoundaryName) {
      if (willRetry) {
        errorBoundaryMessage = 'React will try to recreate this component tree from scratch ' + ('using the error boundary you provided, ' + errorBoundaryName + '.');
      } else {
        errorBoundaryMessage = 'This error was initially handled by the error boundary ' + errorBoundaryName + '. ' + 'Recreating the tree from scratch failed so React will unmount the tree.';
      }
    } else {
      errorBoundaryMessage = 'Consider adding an error boundary to your tree to customize error handling behavior.';
    }

    console.error(componentNameMessage + ' You should fix this error in your code. ' + errorBoundaryMessage + '\n\n' + (errorSummary + '\n\n') + ('The error is located at: ' + componentStack + '\n\n') + ('The error was thrown at: ' + formattedCallStack));
  }

  if (!__DEV__) {
    var _error = capturedError.error;

    console.error('React caught an error thrown by one of your components.\n\n' + _error.stack);
  }
}

exports.injection = {
  injectDialog: function injectDialog(fn) {
    invariant(showDialog === defaultShowDialog, 'The custom dialog was already injected.');
    invariant(typeof fn === 'function', 'Injected showDialog() must be a function.');
    showDialog = fn;
  }
};

exports.logCapturedError = logCapturedError;