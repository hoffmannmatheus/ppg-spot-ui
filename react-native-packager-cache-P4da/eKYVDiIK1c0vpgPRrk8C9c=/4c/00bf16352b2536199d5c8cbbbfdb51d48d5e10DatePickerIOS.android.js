

'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/Components/DatePicker/DatePickerIOS.android.js';
var React = require('React');
var StyleSheet = require('StyleSheet');
var Text = require('Text');
var View = require('View');

var DummyDatePickerIOS = function (_React$Component) {
  babelHelpers.inherits(DummyDatePickerIOS, _React$Component);

  function DummyDatePickerIOS() {
    babelHelpers.classCallCheck(this, DummyDatePickerIOS);
    return babelHelpers.possibleConstructorReturn(this, (DummyDatePickerIOS.__proto__ || Object.getPrototypeOf(DummyDatePickerIOS)).apply(this, arguments));
  }

  babelHelpers.createClass(DummyDatePickerIOS, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        View,
        { style: [styles.dummyDatePickerIOS, this.props.style], __source: {
            fileName: _jsxFileName,
            lineNumber: 22
          }
        },
        React.createElement(
          Text,
          { style: styles.datePickerText, __source: {
              fileName: _jsxFileName,
              lineNumber: 23
            }
          },
          'DatePickerIOS is not supported on this platform!'
        )
      );
    }
  }]);
  return DummyDatePickerIOS;
}(React.Component);

var styles = StyleSheet.create({
  dummyDatePickerIOS: {
    height: 100,
    width: 300,
    backgroundColor: '#ffbcbc',
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  datePickerText: {
    color: '#333333',
    margin: 20
  }
});

module.exports = DummyDatePickerIOS;