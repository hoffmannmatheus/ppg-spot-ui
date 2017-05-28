

var ReactInstanceMap = require('ReactInstanceMap');

var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');

var getContextFiber = function getContextFiber(arg) {
  invariant(false, 'Missing injection for fiber getContextForSubtree');
};

function getContextForSubtree(parentComponent) {
  if (!parentComponent) {
    return emptyObject;
  }

  var instance = ReactInstanceMap.get(parentComponent);
  if (typeof instance.tag === 'number') {
    return getContextFiber(instance);
  } else {
    return instance._processChildContext(instance._context);
  }
}

getContextForSubtree._injectFiber = function (fn) {
  getContextFiber = fn;
};

module.exports = getContextForSubtree;