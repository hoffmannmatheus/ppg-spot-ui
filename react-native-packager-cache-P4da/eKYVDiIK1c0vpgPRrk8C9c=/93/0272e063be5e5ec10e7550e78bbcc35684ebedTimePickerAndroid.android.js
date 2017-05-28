
'use strict';

var TimePickerModule = require('NativeModules').TimePickerAndroid;

var TimePickerAndroid = function () {
  function TimePickerAndroid() {
    babelHelpers.classCallCheck(this, TimePickerAndroid);
  }

  babelHelpers.createClass(TimePickerAndroid, null, [{
    key: 'open',
    value: function open(options) {
      return regeneratorRuntime.async(function open$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', TimePickerModule.open(options));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'timeSetAction',
    get: function get() {
      return 'timeSetAction';
    }
  }, {
    key: 'dismissedAction',
    get: function get() {
      return 'dismissedAction';
    }
  }]);
  return TimePickerAndroid;
}();

module.exports = TimePickerAndroid;