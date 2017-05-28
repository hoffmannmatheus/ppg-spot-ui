

'use strict';

var invariant = require('fbjs/lib/invariant');

var instanceCache = {};
var instanceProps = {};

function getRenderedHostOrTextFromComponent(component) {
  var rendered;
  while (rendered = component._renderedComponent) {
    component = rendered;
  }
  return component;
}

function precacheNode(inst, tag) {
  var nativeInst = getRenderedHostOrTextFromComponent(inst);
  instanceCache[tag] = nativeInst;
}

function precacheFiberNode(hostInst, tag) {
  instanceCache[tag] = hostInst;
}

function uncacheNode(inst) {
  var tag = inst._rootNodeID;
  if (tag) {
    delete instanceCache[tag];
  }
}

function uncacheFiberNode(tag) {
  delete instanceCache[tag];
  delete instanceProps[tag];
}

function getInstanceFromTag(tag) {
  return instanceCache[tag] || null;
}

function getTagFromInstance(inst) {
  var tag = typeof inst.tag !== 'number' ? inst._rootNodeID : inst.stateNode._nativeTag;
  invariant(tag, 'All native instances should have a tag.');
  return tag;
}

function getFiberCurrentPropsFromNode(stateNode) {
  return instanceProps[stateNode._nativeTag] || null;
}

function updateFiberProps(tag, props) {
  instanceProps[tag] = props;
}

var ReactNativeComponentTree = {
  getClosestInstanceFromNode: getInstanceFromTag,
  getInstanceFromNode: getInstanceFromTag,
  getNodeFromInstance: getTagFromInstance,
  precacheFiberNode: precacheFiberNode,
  precacheNode: precacheNode,
  uncacheFiberNode: uncacheFiberNode,
  uncacheNode: uncacheNode,
  getFiberCurrentPropsFromNode: getFiberCurrentPropsFromNode,
  updateFiberProps: updateFiberProps
};

module.exports = ReactNativeComponentTree;