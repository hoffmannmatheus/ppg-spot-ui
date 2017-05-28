
'use strict';

var ReactNative = require('ReactNative');
var UIManager = require('UIManager');

module.exports = function takeSnapshot(view, options) {
  return regeneratorRuntime.async(function takeSnapshot$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (typeof view !== 'number' && view !== 'window') {
            view = ReactNative.findNodeHandle(view) || 'window';
          }

          return _context.abrupt('return', UIManager.__takeSnapshot(view, options));

        case 2:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this);
};