

'use strict';

var REACT_COROUTINE_TYPE;
var REACT_YIELD_TYPE;
if (typeof Symbol === 'function' && (typeof Symbol === 'function' ? Symbol.for : '@@for')) {
  REACT_COROUTINE_TYPE = (typeof Symbol === 'function' ? Symbol.for : '@@for')('react.coroutine');
  REACT_YIELD_TYPE = (typeof Symbol === 'function' ? Symbol.for : '@@for')('react.yield');
} else {
  REACT_COROUTINE_TYPE = 0xeac8;
  REACT_YIELD_TYPE = 0xeac9;
}

exports.createCoroutine = function (children, handler, props) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var coroutine = {
    $$typeof: REACT_COROUTINE_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    handler: handler,
    props: props
  };

  if (__DEV__) {
    if (Object.freeze) {
      Object.freeze(coroutine.props);
      Object.freeze(coroutine);
    }
  }

  return coroutine;
};

exports.createYield = function (value) {
  var yieldNode = {
    $$typeof: REACT_YIELD_TYPE,
    value: value
  };

  if (__DEV__) {
    if (Object.freeze) {
      Object.freeze(yieldNode);
    }
  }

  return yieldNode;
};

exports.isCoroutine = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_COROUTINE_TYPE;
};

exports.isYield = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_YIELD_TYPE;
};

exports.REACT_YIELD_TYPE = REACT_YIELD_TYPE;
exports.REACT_COROUTINE_TYPE = REACT_COROUTINE_TYPE;