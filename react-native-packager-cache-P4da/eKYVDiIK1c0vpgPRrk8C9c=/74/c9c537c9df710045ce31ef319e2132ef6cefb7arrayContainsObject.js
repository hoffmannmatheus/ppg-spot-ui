Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = arrayContainsObject;

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

function arrayContainsObject(array, object) {
  if (array.indexOf(object) > -1) {
    return true;
  }
  for (var i = 0; i < array.length; i++) {
    if (array[i] instanceof _ParseObject2.default && array[i].className === object.className && array[i]._getId() === object._getId()) {
      return true;
    }
  }
  return false;
}