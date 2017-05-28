

'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/Components/Picker/PickerAndroid.android.js';
var ColorPropType = require('ColorPropType');
var React = require('React');
var StyleSheet = require('StyleSheet');
var StyleSheetPropType = require('StyleSheetPropType');
var ViewPropTypes = require('ViewPropTypes');
var ViewStylePropTypes = require('ViewStylePropTypes');

var processColor = require('processColor');
var requireNativeComponent = require('requireNativeComponent');

var ReactPropTypes = React.PropTypes;

var REF_PICKER = 'picker';
var MODE_DROPDOWN = 'dropdown';

var pickerStyleType = StyleSheetPropType(babelHelpers.extends({}, ViewStylePropTypes, {
  color: ColorPropType
}));

var PickerAndroid = function (_React$Component) {
  babelHelpers.inherits(PickerAndroid, _React$Component);

  function PickerAndroid(props, context) {
    babelHelpers.classCallCheck(this, PickerAndroid);

    var _this = babelHelpers.possibleConstructorReturn(this, (PickerAndroid.__proto__ || Object.getPrototypeOf(PickerAndroid)).call(this, props, context));

    _initialiseProps.call(_this);

    var state = _this._stateFromProps(props);

    _this.state = babelHelpers.extends({}, state, {
      initialSelectedIndex: state.selectedIndex
    });
    return _this;
  }

  babelHelpers.createClass(PickerAndroid, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState(this._stateFromProps(nextProps));
    }
  }, {
    key: 'render',
    value: function render() {
      var Picker = this.props.mode === MODE_DROPDOWN ? DropdownPicker : DialogPicker;

      var nativeProps = {
        enabled: this.props.enabled,
        items: this.state.items,
        mode: this.props.mode,
        onSelect: this._onChange,
        prompt: this.props.prompt,
        selected: this.state.initialSelectedIndex,
        testID: this.props.testID,
        style: [styles.pickerAndroid, this.props.style],
        accessibilityLabel: this.props.accessibilityLabel
      };

      return React.createElement(Picker, babelHelpers.extends({ ref: REF_PICKER }, nativeProps, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 112
        }
      }));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._lastNativePosition = this.state.initialSelectedIndex;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.refs[REF_PICKER] && this.state.selectedIndex !== this._lastNativePosition) {
        this.refs[REF_PICKER].setNativeProps({ selected: this.state.selectedIndex });
        this._lastNativePosition = this.state.selectedIndex;
      }
    }
  }]);
  return PickerAndroid;
}(React.Component);

PickerAndroid.propTypes = babelHelpers.extends({}, ViewPropTypes, {
  style: pickerStyleType,
  selectedValue: React.PropTypes.any,
  enabled: ReactPropTypes.bool,
  mode: ReactPropTypes.oneOf(['dialog', 'dropdown']),
  onValueChange: ReactPropTypes.func,
  prompt: ReactPropTypes.string,
  testID: ReactPropTypes.string
});

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this._stateFromProps = function (props) {
    var selectedIndex = 0;
    var items = React.Children.map(props.children, function (child, index) {
      if (child.props.value === props.selectedValue) {
        selectedIndex = index;
      }
      var childProps = {
        value: child.props.value,
        label: child.props.label
      };
      if (child.props.color) {
        childProps.color = processColor(child.props.color);
      }
      return childProps;
    });
    return { selectedIndex: selectedIndex, items: items };
  };

  this._onChange = function (event) {
    if (_this2.props.onValueChange) {
      var position = event.nativeEvent.position;
      if (position >= 0) {
        var children = React.Children.toArray(_this2.props.children);
        var value = children[position].props.value;
        _this2.props.onValueChange(value, position);
      } else {
        _this2.props.onValueChange(null, position);
      }
    }
    _this2._lastNativePosition = event.nativeEvent.position;
    _this2.forceUpdate();
  };
};

var styles = StyleSheet.create({
  pickerAndroid: {
    height: 50
  }
});

var cfg = {
  nativeOnly: {
    items: true,
    selected: true
  }
};

var DropdownPicker = requireNativeComponent('AndroidDropdownPicker', PickerAndroid, cfg);
var DialogPicker = requireNativeComponent('AndroidDialogPicker', PickerAndroid, cfg);

module.exports = PickerAndroid;