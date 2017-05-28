

'use strict';

var REACT_PORTAL_TYPE = typeof Symbol === 'function' && (typeof Symbol === 'function' ? Symbol.for : '@@for') && (typeof Symbol === 'function' ? Symbol.for : '@@for')('react.portal') || 0xeaca;

exports.createPortal = function (children, containerInfo, implementation) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
};

exports.isPortal = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_PORTAL_TYPE;
};

exports.REACT_PORTAL_TYPE = REACT_PORTAL_TYPE;