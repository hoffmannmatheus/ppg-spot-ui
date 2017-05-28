

'use strict';

var checkPropTypes = require('./checkPropTypes');

var _require = require('./ReactDebugCurrentFrame'),
    getStackAddendum = _require.getStackAddendum;

function checkReactTypeSpec(typeSpecs, values, location, componentName) {
  checkPropTypes(typeSpecs, values, location, componentName, getStackAddendum);
}

module.exports = checkReactTypeSpec;