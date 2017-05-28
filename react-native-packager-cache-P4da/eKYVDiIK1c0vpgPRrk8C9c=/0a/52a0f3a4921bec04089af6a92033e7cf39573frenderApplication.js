

'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/ReactNative/renderApplication.js';
var AppContainer = require('AppContainer');
var React = require('React');
var ReactNative = require('ReactNative');

var invariant = require('fbjs/lib/invariant');

require('BackHandler');

function renderApplication(RootComponent, initialProps, rootTag) {
  invariant(rootTag, 'Expect to have a valid rootTag, instead got ', rootTag);
  ReactNative.render(React.createElement(
    AppContainer,
    { rootTag: rootTag, __source: {
        fileName: _jsxFileName,
        lineNumber: 34
      }
    },
    React.createElement(RootComponent, babelHelpers.extends({}, initialProps, {
      rootTag: rootTag,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 35
      }
    }))
  ), rootTag);
}

module.exports = renderApplication;