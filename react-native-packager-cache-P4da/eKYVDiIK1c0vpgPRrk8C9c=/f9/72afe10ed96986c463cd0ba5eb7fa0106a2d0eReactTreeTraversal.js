

'use strict';

var _require = require('ReactTypeOfWork'),
    HostComponent = _require.HostComponent;

function getParent(inst) {
  if (inst._hostParent !== undefined) {
    return inst._hostParent;
  }
  if (typeof inst.tag === 'number') {
    do {
      inst = inst.return;
    } while (inst && inst.tag !== HostComponent);
    if (inst) {
      return inst;
    }
  }
  return null;
}

function getLowestCommonAncestor(instA, instB) {
  var depthA = 0;
  for (var tempA = instA; tempA; tempA = getParent(tempA)) {
    depthA++;
  }
  var depthB = 0;
  for (var tempB = instB; tempB; tempB = getParent(tempB)) {
    depthB++;
  }

  while (depthA - depthB > 0) {
    instA = getParent(instA);
    depthA--;
  }

  while (depthB - depthA > 0) {
    instB = getParent(instB);
    depthB--;
  }

  var depth = depthA;
  while (depth--) {
    if (instA === instB || instA === instB.alternate) {
      return instA;
    }
    instA = getParent(instA);
    instB = getParent(instB);
  }
  return null;
}

function isAncestor(instA, instB) {
  while (instB) {
    if (instA === instB || instA === instB.alternate) {
      return true;
    }
    instB = getParent(instB);
  }
  return false;
}

function getParentInstance(inst) {
  return getParent(inst);
}

function traverseTwoPhase(inst, fn, arg) {
  var path = [];
  while (inst) {
    path.push(inst);
    inst = getParent(inst);
  }
  var i;
  for (i = path.length; i-- > 0;) {
    fn(path[i], 'captured', arg);
  }
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}

function traverseEnterLeave(from, to, fn, argFrom, argTo) {
  var common = from && to ? getLowestCommonAncestor(from, to) : null;
  var pathFrom = [];
  while (from && from !== common) {
    pathFrom.push(from);
    from = getParent(from);
  }
  var pathTo = [];
  while (to && to !== common) {
    pathTo.push(to);
    to = getParent(to);
  }
  var i;
  for (i = 0; i < pathFrom.length; i++) {
    fn(pathFrom[i], 'bubbled', argFrom);
  }
  for (i = pathTo.length; i-- > 0;) {
    fn(pathTo[i], 'captured', argTo);
  }
}

module.exports = {
  isAncestor: isAncestor,
  getLowestCommonAncestor: getLowestCommonAncestor,
  getParentInstance: getParentInstance,
  traverseTwoPhase: traverseTwoPhase,
  traverseEnterLeave: traverseEnterLeave
};