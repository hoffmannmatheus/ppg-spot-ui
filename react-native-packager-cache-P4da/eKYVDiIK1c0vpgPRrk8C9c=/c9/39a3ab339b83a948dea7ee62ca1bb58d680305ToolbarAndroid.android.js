

'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/Components/ToolbarAndroid/ToolbarAndroid.android.js';
var Image = require('Image');
var NativeMethodsMixin = require('NativeMethodsMixin');
var React = require('React');
var ReactNativeViewAttributes = require('ReactNativeViewAttributes');
var UIManager = require('UIManager');
var ViewPropTypes = require('ViewPropTypes');
var ColorPropType = require('ColorPropType');

var requireNativeComponent = require('requireNativeComponent');
var resolveAssetSource = require('resolveAssetSource');

var ReactPropTypes = React.PropTypes;

var optionalImageSource = ReactPropTypes.oneOfType([Image.propTypes.source, ReactPropTypes.oneOf([])]);

var ToolbarAndroid = React.createClass({
  displayName: 'ToolbarAndroid',

  mixins: [NativeMethodsMixin],

  propTypes: babelHelpers.extends({}, ViewPropTypes, {
    actions: ReactPropTypes.arrayOf(ReactPropTypes.shape({
      title: ReactPropTypes.string.isRequired,
      icon: optionalImageSource,
      show: ReactPropTypes.oneOf(['always', 'ifRoom', 'never']),
      showWithText: ReactPropTypes.bool
    })),

    logo: optionalImageSource,

    navIcon: optionalImageSource,

    onActionSelected: ReactPropTypes.func,

    onIconClicked: ReactPropTypes.func,

    overflowIcon: optionalImageSource,

    subtitle: ReactPropTypes.string,

    subtitleColor: ColorPropType,

    title: ReactPropTypes.string,

    titleColor: ColorPropType,

    contentInsetStart: ReactPropTypes.number,

    contentInsetEnd: ReactPropTypes.number,

    rtl: ReactPropTypes.bool,

    testID: ReactPropTypes.string
  }),

  render: function render() {
    var nativeProps = babelHelpers.extends({}, this.props);
    if (this.props.logo) {
      nativeProps.logo = resolveAssetSource(this.props.logo);
    }
    if (this.props.navIcon) {
      nativeProps.navIcon = resolveAssetSource(this.props.navIcon);
    }
    if (this.props.overflowIcon) {
      nativeProps.overflowIcon = resolveAssetSource(this.props.overflowIcon);
    }
    if (this.props.actions) {
      var nativeActions = [];
      for (var i = 0; i < this.props.actions.length; i++) {
        var action = babelHelpers.extends({}, this.props.actions[i]);
        if (action.icon) {
          action.icon = resolveAssetSource(action.icon);
        }
        if (action.show) {
          action.show = UIManager.ToolbarAndroid.Constants.ShowAsAction[action.show];
        }
        nativeActions.push(action);
      }
      nativeProps.nativeActions = nativeActions;
    }

    return React.createElement(NativeToolbar, babelHelpers.extends({ onSelect: this._onSelect }, nativeProps, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 195
      }
    }));
  },

  _onSelect: function _onSelect(event) {
    var position = event.nativeEvent.position;
    if (position === -1) {
      this.props.onIconClicked && this.props.onIconClicked();
    } else {
      this.props.onActionSelected && this.props.onActionSelected(position);
    }
  }
});

var NativeToolbar = requireNativeComponent('ToolbarAndroid', ToolbarAndroid, {
  nativeOnly: {
    nativeActions: true
  }
});

module.exports = ToolbarAndroid;