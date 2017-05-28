

'use strict';

var checkPropTypes = require('react/lib/checkPropTypes');

var _require = require('react/lib/ReactDebugCurrentFrame'),
    getStackAddendum = _require.getStackAddendum;

function checkReactTypeSpec(typeSpecs, values, location, componentName) {
  checkPropTypes(typeSpecs, values, location, componentName, getStackAddendum);
}

module.exports = checkReactTypeSpec;