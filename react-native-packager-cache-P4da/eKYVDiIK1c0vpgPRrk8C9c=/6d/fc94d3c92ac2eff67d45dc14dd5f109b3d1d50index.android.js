var _jsxFileName = '/Users/mattsilva/projects/paramotor_spots_ui/index.android.js';

var _react = require('react');

var _react2 = babelHelpers.interopRequireDefault(_react);

var _reactNative = require('react-native');

var Parse = require('parse/react-native');

var ListViewBasics = function (_Component) {
  babelHelpers.inherits(ListViewBasics, _Component);

  function ListViewBasics(props) {
    babelHelpers.classCallCheck(this, ListViewBasics);

    var _this = babelHelpers.possibleConstructorReturn(this, (ListViewBasics.__proto__ || Object.getPrototypeOf(ListViewBasics)).call(this, props));

    var ds = new _reactNative.ListView.DataSource({ rowHasChanged: function rowHasChanged(r1, r2) {
        return r1 !== r2;
      } });
    _this.state = {
      dataSource: ds.cloneWithRows(['John', 'Joel', 'James', 'Jimmy', 'Jackson', 'Jillian', 'Julie', 'Devin'])
    };

    Parse.initialize("ParamotorSpots");
    Parse.serverURL = "http://104.131.179.248:1337/parse";
    var query = new Parse.Query(Parse.Object.extend("Spot"));
    var instance = _this;
    query.find({
      success: function success(results) {
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          instance.state.dataSource.items.push(object.id + ' - ' + object.get('name'));
        }
      },
      error: function error(_error) {
        alert("Error: " + _error.code + " " + _error.message);
      }
    });
    return _this;
  }

  babelHelpers.createClass(ListViewBasics, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactNative.View,
        { style: { flex: 1, paddingTop: 22 }, __source: {
            fileName: _jsxFileName,
            lineNumber: 35
          }
        },
        _react2.default.createElement(_reactNative.ListView, {
          dataSource: this.state.dataSource,
          renderRow: function renderRow(rowData) {
            return _react2.default.createElement(
              _reactNative.Text,
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 38
                }
              },
              rowData
            );
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 36
          }
        })
      );
    }
  }]);
  return ListViewBasics;
}(_react.Component);

_reactNative.AppRegistry.registerComponent('paramotor_spots', function () {
  return ListViewBasics;
});