

'use strict';

var ReactTypeOfWork = require('./ReactTypeOfWork');
var IndeterminateComponent = ReactTypeOfWork.IndeterminateComponent,
    FunctionalComponent = ReactTypeOfWork.FunctionalComponent,
    ClassComponent = ReactTypeOfWork.ClassComponent,
    HostComponent = ReactTypeOfWork.HostComponent;

var getComponentName = require('./getComponentName');

function describeComponentFrame(name, source, ownerName) {
  return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
}

function describeFiber(fiber) {
  switch (fiber.tag) {
    case IndeterminateComponent:
    case FunctionalComponent:
    case ClassComponent:
    case HostComponent:
      var owner = fiber._debugOwner;
      var source = fiber._debugSource;
      var name = getComponentName(fiber);
      var ownerName = null;
      if (owner) {
        ownerName = getComponentName(owner);
      }
      return describeComponentFrame(name, source, ownerName);
    default:
      return '';
  }
}

function getStackAddendumByWorkInProgressFiber(workInProgress) {
  var info = '';
  var node = workInProgress;
  do {
    info += describeFiber(node);

    node = node['return'];
  } while (node);
  return info;
}

module.exports = {
  getStackAddendumByWorkInProgressFiber: getStackAddendumByWorkInProgressFiber,
  describeComponentFrame: describeComponentFrame
};