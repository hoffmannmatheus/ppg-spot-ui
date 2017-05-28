Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = unique;

var _arrayContainsObject = require('./arrayContainsObject');

var _arrayContainsObject2 = babelHelpers.interopRequireDefault(_arrayContainsObject);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

function unique(arr) {
  var uniques = [];
  arr.forEach(function (value) {
    if (value instanceof _ParseObject2.default) {
      if (!(0, _arrayContainsObject2.default)(uniques, value)) {
        uniques.push(value);
      }
    } else {
      if (uniques.indexOf(value) < 0) {
        uniques.push(value);
      }
    }
  });
  return uniques;
}