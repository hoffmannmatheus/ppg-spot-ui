

'use strict';

var ExceptionsManager = require('ExceptionsManager');

function ReactNativeFiberErrorDialog(capturedError) {
  var componentStack = capturedError.componentStack,
      error = capturedError.error;


  var errorMessage = void 0;
  var errorStack = void 0;
  var errorType = void 0;

  if (error && typeof error === 'object') {
    var message = error.message,
        name = error.name;


    var summary = message ? name + ': ' + message : name;

    errorMessage = summary + '\n\nThis error is located at:' + componentStack;
    errorStack = error.stack;
    errorType = error.constructor;
  } else {
    errorMessage = 'Unspecified error at:' + componentStack;
    errorStack = '';
    errorType = Error;
  }

  var newError = new errorType(errorMessage);
  newError.stack = errorStack;

  ExceptionsManager.handleException(newError, false);

  return false;
}

module.exports.showDialog = ReactNativeFiberErrorDialog;