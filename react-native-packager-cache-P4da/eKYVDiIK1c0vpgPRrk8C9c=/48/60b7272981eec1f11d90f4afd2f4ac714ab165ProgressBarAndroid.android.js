
'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid.android.js';
var NativeMethodsMixin = require('NativeMethodsMixin');
var React = require('React');
var ViewPropTypes = require('ViewPropTypes');
var ColorPropType = require('ColorPropType');

var requireNativeComponent = require('requireNativeComponent');

var ReactPropTypes = React.PropTypes;

var STYLE_ATTRIBUTES = ['Horizontal', 'Normal', 'Small', 'Large', 'Inverse', 'SmallInverse', 'LargeInverse'];

var indeterminateType = function indeterminateType(props, propName, componentName) {
  var checker = function checker() {
    var indeterminate = props[propName];
    var styleAttr = props.styleAttr;
    if (!indeterminate && styleAttr !== 'Horizontal') {
      return new Error('indeterminate=false is only valid for styleAttr=Horizontal');
    }
  };

  return ReactPropTypes.bool(props, propName, componentName) || checker();
};

var ProgressBarAndroid = React.createClass({
  displayName: 'ProgressBarAndroid',

  propTypes: babelHelpers.extends({}, ViewPropTypes, {
    styleAttr: ReactPropTypes.oneOf(STYLE_ATTRIBUTES),

    indeterminate: indeterminateType,

    progress: ReactPropTypes.number,

    color: ColorPropType,

    testID: ReactPropTypes.string
  }),

  getDefaultProps: function getDefaultProps() {
    return {
      styleAttr: 'Normal',
      indeterminate: true
    };
  },

  mixins: [NativeMethodsMixin],

  componentDidMount: function componentDidMount() {
    if (this.props.indeterminate && this.props.styleAttr !== 'Horizontal') {
      console.warn('Circular indeterminate `ProgressBarAndroid`' + 'is deprecated. Use `ActivityIndicator` instead.');
    }
  },

  render: function render() {
    return React.createElement(AndroidProgressBar, babelHelpers.extends({}, this.props, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 120
      }
    }));
  }
});

var AndroidProgressBar = requireNativeComponent('AndroidProgressBar', ProgressBarAndroid, { nativeOnly: { animating: true } });

module.exports = ProgressBarAndroid;