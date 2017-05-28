

'use strict';

var invariant = require('fbjs/lib/invariant');

function validateCallback(callback) {
  invariant(!callback || typeof callback === 'function', 'Invalid argument passed as callback. Expected a function. Instead ' + 'received: %s', callback);
}

module.exports = validateCallback;