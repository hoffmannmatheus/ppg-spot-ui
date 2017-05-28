var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _reactNative = require('react-native/Libraries/react-native/react-native.js');

var StorageController = {
  async: 1,

  getItemAsync: function getItemAsync(path) {
    var p = new _ParsePromise2.default();
    _reactNative.AsyncStorage.getItem(path, function (err, value) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },
  setItemAsync: function setItemAsync(path, value) {
    var p = new _ParsePromise2.default();
    _reactNative.AsyncStorage.setItem(path, value, function (err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },
  removeItemAsync: function removeItemAsync(path) {
    var p = new _ParsePromise2.default();
    _reactNative.AsyncStorage.removeItem(path, function (err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve();
      }
    });
    return p;
  },
  clear: function clear() {
    _reactNative.AsyncStorage.clear();
  }
};

module.exports = StorageController;