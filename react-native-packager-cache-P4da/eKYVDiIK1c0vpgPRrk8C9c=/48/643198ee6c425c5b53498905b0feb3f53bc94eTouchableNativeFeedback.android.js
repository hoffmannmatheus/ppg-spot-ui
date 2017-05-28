
'use strict';

var Platform = require('Platform');
var React = require('React');
var ReactNative = require('ReactNative');
var Touchable = require('Touchable');
var TouchableWithoutFeedback = require('TouchableWithoutFeedback');
var UIManager = require('UIManager');

var ensurePositiveDelayProps = require('ensurePositiveDelayProps');
var processColor = require('processColor');

var PropTypes = React.PropTypes;

var rippleBackgroundPropType = PropTypes.shape({
  type: React.PropTypes.oneOf(['RippleAndroid']),
  color: PropTypes.number,
  borderless: PropTypes.bool
});

var themeAttributeBackgroundPropType = PropTypes.shape({
  type: React.PropTypes.oneOf(['ThemeAttrAndroid']),
  attribute: PropTypes.string.isRequired
});

var backgroundPropType = PropTypes.oneOfType([rippleBackgroundPropType, themeAttributeBackgroundPropType]);

var PRESS_RETENTION_OFFSET = { top: 20, left: 20, right: 20, bottom: 30 };

var TouchableNativeFeedback = React.createClass({
  displayName: 'TouchableNativeFeedback',

  propTypes: babelHelpers.extends({}, TouchableWithoutFeedback.propTypes, {
    background: backgroundPropType,

    useForeground: PropTypes.bool
  }),

  statics: {
    SelectableBackground: function SelectableBackground() {
      return { type: 'ThemeAttrAndroid', attribute: 'selectableItemBackground' };
    },

    SelectableBackgroundBorderless: function SelectableBackgroundBorderless() {
      return { type: 'ThemeAttrAndroid', attribute: 'selectableItemBackgroundBorderless' };
    },

    Ripple: function Ripple(color, borderless) {
      return { type: 'RippleAndroid', color: processColor(color), borderless: borderless };
    },

    canUseNativeForeground: function canUseNativeForeground() {
      return Platform.OS === 'android' && Platform.Version >= 23;
    }
  },

  mixins: [Touchable.Mixin],

  getDefaultProps: function getDefaultProps() {
    return {
      background: this.SelectableBackground()
    };
  },

  getInitialState: function getInitialState() {
    return this.touchableGetInitialState();
  },

  componentDidMount: function componentDidMount() {
    ensurePositiveDelayProps(this.props);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    ensurePositiveDelayProps(nextProps);
  },

  touchableHandleActivePressIn: function touchableHandleActivePressIn(e) {
    this.props.onPressIn && this.props.onPressIn(e);
    this._dispatchPressedStateChange(true);
    this._dispatchHotspotUpdate(this.pressInLocation.locationX, this.pressInLocation.locationY);
  },

  touchableHandleActivePressOut: function touchableHandleActivePressOut(e) {
    this.props.onPressOut && this.props.onPressOut(e);
    this._dispatchPressedStateChange(false);
  },

  touchableHandlePress: function touchableHandlePress(e) {
    this.props.onPress && this.props.onPress(e);
  },

  touchableHandleLongPress: function touchableHandleLongPress(e) {
    this.props.onLongPress && this.props.onLongPress(e);
  },

  touchableGetPressRectOffset: function touchableGetPressRectOffset() {
    return this.props.pressRetentionOffset || PRESS_RETENTION_OFFSET;
  },

  touchableGetHitSlop: function touchableGetHitSlop() {
    return this.props.hitSlop;
  },

  touchableGetHighlightDelayMS: function touchableGetHighlightDelayMS() {
    return this.props.delayPressIn;
  },

  touchableGetLongPressDelayMS: function touchableGetLongPressDelayMS() {
    return this.props.delayLongPress;
  },

  touchableGetPressOutDelayMS: function touchableGetPressOutDelayMS() {
    return this.props.delayPressOut;
  },

  _handleResponderMove: function _handleResponderMove(e) {
    this.touchableHandleResponderMove(e);
    this._dispatchHotspotUpdate(e.nativeEvent.locationX, e.nativeEvent.locationY);
  },

  _dispatchHotspotUpdate: function _dispatchHotspotUpdate(destX, destY) {
    UIManager.dispatchViewManagerCommand(ReactNative.findNodeHandle(this), UIManager.RCTView.Commands.hotspotUpdate, [destX || 0, destY || 0]);
  },

  _dispatchPressedStateChange: function _dispatchPressedStateChange(pressed) {
    UIManager.dispatchViewManagerCommand(ReactNative.findNodeHandle(this), UIManager.RCTView.Commands.setPressed, [pressed]);
  },

  render: function render() {
    var _babelHelpers$extends;

    var child = React.Children.only(this.props.children);
    var children = child.props.children;
    if (Touchable.TOUCH_TARGET_DEBUG && child.type.displayName === 'View') {
      if (!Array.isArray(children)) {
        children = [children];
      }
      children.push(Touchable.renderDebugView({ color: 'brown', hitSlop: this.props.hitSlop }));
    }
    if (this.props.useForeground && !TouchableNativeFeedback.canUseNativeForeground()) {
      console.warn('Requested foreground ripple, but it is not available on this version of Android. ' + 'Consider calling TouchableNativeFeedback.canUseNativeForeground() and using a different ' + 'Touchable if the result is false.');
    }
    var drawableProp = this.props.useForeground && TouchableNativeFeedback.canUseNativeForeground() ? 'nativeForegroundAndroid' : 'nativeBackgroundAndroid';
    var childProps = babelHelpers.extends({}, child.props, (_babelHelpers$extends = {}, babelHelpers.defineProperty(_babelHelpers$extends, drawableProp, this.props.background), babelHelpers.defineProperty(_babelHelpers$extends, 'accessible', this.props.accessible !== false), babelHelpers.defineProperty(_babelHelpers$extends, 'accessibilityLabel', this.props.accessibilityLabel), babelHelpers.defineProperty(_babelHelpers$extends, 'accessibilityComponentType', this.props.accessibilityComponentType), babelHelpers.defineProperty(_babelHelpers$extends, 'accessibilityTraits', this.props.accessibilityTraits), babelHelpers.defineProperty(_babelHelpers$extends, 'children', children), babelHelpers.defineProperty(_babelHelpers$extends, 'testID', this.props.testID), babelHelpers.defineProperty(_babelHelpers$extends, 'onLayout', this.props.onLayout), babelHelpers.defineProperty(_babelHelpers$extends, 'hitSlop', this.props.hitSlop), babelHelpers.defineProperty(_babelHelpers$extends, 'onStartShouldSetResponder', this.touchableHandleStartShouldSetResponder), babelHelpers.defineProperty(_babelHelpers$extends, 'onResponderTerminationRequest', this.touchableHandleResponderTerminationRequest), babelHelpers.defineProperty(_babelHelpers$extends, 'onResponderGrant', this.touchableHandleResponderGrant), babelHelpers.defineProperty(_babelHelpers$extends, 'onResponderMove', this._handleResponderMove), babelHelpers.defineProperty(_babelHelpers$extends, 'onResponderRelease', this.touchableHandleResponderRelease), babelHelpers.defineProperty(_babelHelpers$extends, 'onResponderTerminate', this.touchableHandleResponderTerminate), _babelHelpers$extends));

    return React.cloneElement(child, childProps);
  }
});

module.exports = TouchableNativeFeedback;