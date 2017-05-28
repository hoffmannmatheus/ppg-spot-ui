
'use strict';

var EdgeInsetsPropType = require('EdgeInsetsPropType');
var Platform = require('Platform');
var StyleSheetPropType = require('StyleSheetPropType');
var ViewStylePropTypes = require('ViewStylePropTypes');

var _require = require('React'),
    PropTypes = _require.PropTypes;

var _require2 = require('ViewAccessibility'),
    AccessibilityComponentTypes = _require2.AccessibilityComponentTypes,
    AccessibilityTraits = _require2.AccessibilityTraits;

var TVViewPropTypes = {};
if (Platform.isTVOS) {
  TVViewPropTypes = require('TVViewPropTypes');
}

var stylePropType = StyleSheetPropType(ViewStylePropTypes);

module.exports = babelHelpers.extends({}, TVViewPropTypes, {
  accessible: PropTypes.bool,

  accessibilityLabel: PropTypes.node,

  accessibilityComponentType: PropTypes.oneOf(AccessibilityComponentTypes),

  accessibilityLiveRegion: PropTypes.oneOf(['none', 'polite', 'assertive']),

  importantForAccessibility: PropTypes.oneOf(['auto', 'yes', 'no', 'no-hide-descendants']),

  accessibilityTraits: PropTypes.oneOfType([PropTypes.oneOf(AccessibilityTraits), PropTypes.arrayOf(PropTypes.oneOf(AccessibilityTraits))]),

  accessibilityViewIsModal: PropTypes.bool,

  onAccessibilityTap: PropTypes.func,

  onMagicTap: PropTypes.func,

  testID: PropTypes.string,

  onResponderGrant: PropTypes.func,

  onResponderMove: PropTypes.func,

  onResponderReject: PropTypes.func,

  onResponderRelease: PropTypes.func,

  onResponderTerminate: PropTypes.func,

  onResponderTerminationRequest: PropTypes.func,

  onStartShouldSetResponder: PropTypes.func,

  onStartShouldSetResponderCapture: PropTypes.func,

  onMoveShouldSetResponder: PropTypes.func,

  onMoveShouldSetResponderCapture: PropTypes.func,

  hitSlop: EdgeInsetsPropType,

  onLayout: PropTypes.func,

  pointerEvents: PropTypes.oneOf(['box-none', 'none', 'box-only', 'auto']),
  style: stylePropType,

  removeClippedSubviews: PropTypes.bool,

  renderToHardwareTextureAndroid: PropTypes.bool,

  shouldRasterizeIOS: PropTypes.bool,

  collapsable: PropTypes.bool,

  needsOffscreenAlphaCompositing: PropTypes.bool
});