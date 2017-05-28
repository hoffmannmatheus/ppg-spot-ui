
'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/Components/ScrollView/ScrollViewStickyHeader.js';
var Animated = require('Animated');
var React = require('React');
var StyleSheet = require('StyleSheet');

var ScrollViewStickyHeader = function (_React$Component) {
  babelHelpers.inherits(ScrollViewStickyHeader, _React$Component);

  function ScrollViewStickyHeader(props, context) {
    babelHelpers.classCallCheck(this, ScrollViewStickyHeader);

    var _this = babelHelpers.possibleConstructorReturn(this, (ScrollViewStickyHeader.__proto__ || Object.getPrototypeOf(ScrollViewStickyHeader)).call(this, props, context));

    _this._onLayout = function (event) {
      _this.setState({
        measured: true,
        layoutY: event.nativeEvent.layout.y,
        layoutHeight: event.nativeEvent.layout.height
      });

      _this.props.onLayout(event);
      var child = React.Children.only(_this.props.children);
      if (child.props.onLayout) {
        child.props.onLayout(event);
      }
    };

    _this.state = {
      measured: false,
      layoutY: 0,
      layoutHeight: 0,
      nextHeaderLayoutY: props.nextHeaderLayoutY
    };
    return _this;
  }

  babelHelpers.createClass(ScrollViewStickyHeader, [{
    key: 'setNextHeaderY',
    value: function setNextHeaderY(y) {
      this.setState({ nextHeaderLayoutY: y });
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state,
          measured = _state.measured,
          layoutHeight = _state.layoutHeight,
          layoutY = _state.layoutY,
          nextHeaderLayoutY = _state.nextHeaderLayoutY;


      var translateY = void 0;
      if (measured) {
        var inputRange = [-1, 0, layoutY];
        var outputRange = [0, 0, 0];

        var collisionPoint = (nextHeaderLayoutY || 0) - layoutHeight;
        if (collisionPoint >= layoutY) {
          inputRange.push(collisionPoint, collisionPoint + 1);
          outputRange.push(collisionPoint - layoutY, collisionPoint - layoutY);
        } else {
          inputRange.push(layoutY + 1);
          outputRange.push(1);
        }
        translateY = this.props.scrollAnimatedValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRange
        });
      } else {
        translateY = 0;
      }

      var child = React.Children.only(this.props.children);

      return React.createElement(
        Animated.View,
        {
          collapsable: false,
          onLayout: this._onLayout,
          style: [child.props.style, styles.header, { transform: [{ translateY: translateY }] }], __source: {
            fileName: _jsxFileName,
            lineNumber: 100
          }
        },
        React.cloneElement(child, {
          style: styles.fill,
          onLayout: undefined })
      );
    }
  }]);
  return ScrollViewStickyHeader;
}(React.Component);

var styles = StyleSheet.create({
  header: {
    zIndex: 10
  },
  fill: {
    flex: 1
  }
});

module.exports = ScrollViewStickyHeader;