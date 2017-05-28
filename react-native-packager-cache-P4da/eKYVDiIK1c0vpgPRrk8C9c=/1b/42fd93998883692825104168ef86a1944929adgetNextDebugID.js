

'use strict';

var nextDebugID = 1;

function getNextDebugID() {
  return nextDebugID++;
}

module.exports = getNextDebugID;