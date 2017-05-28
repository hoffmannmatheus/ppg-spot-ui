
'use strict';

function mountSafeCallback(context, callback) {
  return function () {
    if (!callback || typeof context.isMounted === 'function' && !context.isMounted()) {
      return undefined;
    }
    return callback.apply(context, arguments);
  };
}

function throwOnStylesProp(component, props) {
  if (props.styles !== undefined) {
    var owner = component._owner || null;
    var name = component.constructor.displayName;
    var msg = '`styles` is not a supported property of `' + name + '`, did ' + 'you mean `style` (singular)?';
    if (owner && owner.constructor && owner.constructor.displayName) {
      msg += '\n\nCheck the `' + owner.constructor.displayName + '` parent ' + ' component.';
    }
    throw new Error(msg);
  }
}

function warnForStyleProps(props, validAttributes) {
  for (var key in validAttributes.style) {
    if (!(validAttributes[key] || props[key] === undefined)) {
      console.error('You are setting the style `{ ' + key + ': ... }` as a prop. You ' + 'should nest it in a style object. ' + 'E.g. `{ style: { ' + key + ': ... } }`');
    }
  }
}

module.exports = {
  mountSafeCallback: mountSafeCallback,
  throwOnStylesProp: throwOnStylesProp,
  warnForStyleProps: warnForStyleProps
};