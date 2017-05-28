
'use strict';

var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/node_modules/react-native/Libraries/Lists/FlatList.js';
var MetroListView = require('MetroListView');
var React = require('React');
var ReactNative = require('ReactNative');
var View = require('View');
var VirtualizedList = require('VirtualizedList');

var invariant = require('fbjs/lib/invariant');

var defaultProps = babelHelpers.extends({}, VirtualizedList.defaultProps, {
  getItem: undefined,
  getItemCount: undefined,
  numColumns: 1
});

var FlatList = function (_React$PureComponent) {
  babelHelpers.inherits(FlatList, _React$PureComponent);

  function FlatList() {
    var _ref;

    var _temp, _this, _ret;

    babelHelpers.classCallCheck(this, FlatList);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = FlatList.__proto__ || Object.getPrototypeOf(FlatList)).call.apply(_ref, [this].concat(args))), _this), _this._hasWarnedLegacy = false, _this._captureRef = function (ref) {
      _this._listRef = ref;
    }, _this._getItem = function (data, index) {
      var numColumns = _this.props.numColumns;

      if (numColumns > 1) {
        var ret = [];
        for (var kk = 0; kk < numColumns; kk++) {
          var _item = data[index * numColumns + kk];
          _item && ret.push(_item);
        }
        return ret;
      } else {
        return data[index];
      }
    }, _this._getItemCount = function (data) {
      return data ? Math.ceil(data.length / _this.props.numColumns) : 0;
    }, _this._keyExtractor = function (items, index) {
      var _this$props = _this.props,
          keyExtractor = _this$props.keyExtractor,
          numColumns = _this$props.numColumns;

      if (numColumns > 1) {
        invariant(Array.isArray(items), 'FlatList: Encountered internal consistency error, expected each item to consist of an ' + 'array with 1-%s columns; instead, received a single item.', numColumns);
        return items.map(function (it, kk) {
          return keyExtractor(it, index * numColumns + kk);
        }).join(':');
      } else {
        return keyExtractor(items, index);
      }
    }, _this._onViewableItemsChanged = function (info) {
      var _this$props2 = _this.props,
          numColumns = _this$props2.numColumns,
          onViewableItemsChanged = _this$props2.onViewableItemsChanged;

      if (!onViewableItemsChanged) {
        return;
      }
      if (numColumns > 1) {
        var _changed = [];
        var _viewableItems = [];
        info.viewableItems.forEach(function (v) {
          return _this._pushMultiColumnViewable(_viewableItems, v);
        });
        info.changed.forEach(function (v) {
          return _this._pushMultiColumnViewable(_changed, v);
        });
        onViewableItemsChanged({ viewableItems: _viewableItems, changed: _changed });
      } else {
        onViewableItemsChanged(info);
      }
    }, _this._renderItem = function (info) {
      var _this$props3 = _this.props,
          renderItem = _this$props3.renderItem,
          numColumns = _this$props3.numColumns,
          columnWrapperStyle = _this$props3.columnWrapperStyle;

      if (numColumns > 1) {
        var _item2 = info.item,
            _index = info.index;

        invariant(Array.isArray(_item2), 'Expected array of items with numColumns > 1');
        return React.createElement(
          View,
          { style: [{ flexDirection: 'row' }, columnWrapperStyle], __source: {
              fileName: _jsxFileName,
              lineNumber: 414
            }
          },
          _item2.map(function (it, kk) {
            var element = renderItem({ item: it, index: _index * numColumns + kk });
            return element && React.cloneElement(element, { key: kk });
          })
        );
      } else {
        return renderItem(info);
      }
    }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
  }

  babelHelpers.createClass(FlatList, [{
    key: 'scrollToEnd',
    value: function scrollToEnd(params) {
      this._listRef.scrollToEnd(params);
    }
  }, {
    key: 'scrollToIndex',
    value: function scrollToIndex(params) {
      this._listRef.scrollToIndex(params);
    }
  }, {
    key: 'scrollToItem',
    value: function scrollToItem(params) {
      this._listRef.scrollToItem(params);
    }
  }, {
    key: 'scrollToOffset',
    value: function scrollToOffset(params) {
      this._listRef.scrollToOffset(params);
    }
  }, {
    key: 'recordInteraction',
    value: function recordInteraction() {
      this._listRef.recordInteraction();
    }
  }, {
    key: 'getScrollableNode',
    value: function getScrollableNode() {
      if (this._listRef && this._listRef.getScrollableNode) {
        return this._listRef.getScrollableNode();
      } else {
        return ReactNative.findNodeHandle(this._listRef);
      }
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      this._checkProps(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      invariant(nextProps.numColumns === this.props.numColumns, 'Changing numColumns on the fly is not supported. Change the key prop on FlatList when ' + 'changing the number of columns to force a fresh render of the component.');
      this._checkProps(nextProps);
    }
  }, {
    key: '_checkProps',
    value: function _checkProps(props) {
      var getItem = props.getItem,
          getItemCount = props.getItemCount,
          horizontal = props.horizontal,
          legacyImplementation = props.legacyImplementation,
          numColumns = props.numColumns,
          columnWrapperStyle = props.columnWrapperStyle;

      invariant(!getItem && !getItemCount, 'FlatList does not support custom data formats.');
      if (numColumns > 1) {
        invariant(!horizontal, 'numColumns does not support horizontal.');
      } else {
        invariant(!columnWrapperStyle, 'columnWrapperStyle not supported for single column lists');
      }
      if (legacyImplementation) {
        invariant(numColumns === 1, 'Legacy list does not support multiple columns.');

        if (!this._hasWarnedLegacy) {
          console.warn('FlatList: Using legacyImplementation - some features not supported and performance ' + 'may suffer');
          this._hasWarnedLegacy = true;
        }
      }
    }
  }, {
    key: '_pushMultiColumnViewable',
    value: function _pushMultiColumnViewable(arr, v) {
      var _props = this.props,
          numColumns = _props.numColumns,
          keyExtractor = _props.keyExtractor;

      v.item.forEach(function (item, ii) {
        invariant(v.index != null, 'Missing index!');
        var index = v.index * numColumns + ii;
        arr.push(babelHelpers.extends({}, v, { item: item, key: keyExtractor(item, index), index: index }));
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.legacyImplementation) {
        return React.createElement(MetroListView, babelHelpers.extends({}, this.props, { items: this.props.data, ref: this._captureRef, __source: {
            fileName: _jsxFileName,
            lineNumber: 428
          }
        }));
      } else {
        return React.createElement(VirtualizedList, babelHelpers.extends({}, this.props, {
          renderItem: this._renderItem,
          getItem: this._getItem,
          getItemCount: this._getItemCount,
          keyExtractor: this._keyExtractor,
          ref: this._captureRef,
          onViewableItemsChanged: this.props.onViewableItemsChanged && this._onViewableItemsChanged,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 431
          }
        }));
      }
    }
  }]);
  return FlatList;
}(React.PureComponent);

FlatList.defaultProps = defaultProps;


module.exports = FlatList;