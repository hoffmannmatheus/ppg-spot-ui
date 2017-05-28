

'use strict';

var EventPluginRegistry = require('EventPluginRegistry');
var EventPluginUtils = require('EventPluginUtils');
var ReactErrorUtils = require('ReactErrorUtils');

var accumulateInto = require('accumulateInto');
var forEachAccumulated = require('forEachAccumulated');
var invariant = require('fbjs/lib/invariant');

var eventQueue = null;

var executeDispatchesAndRelease = function executeDispatchesAndRelease(event, simulated) {
  if (event) {
    EventPluginUtils.executeDispatchesInOrder(event, simulated);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};
var executeDispatchesAndReleaseSimulated = function executeDispatchesAndReleaseSimulated(e) {
  return executeDispatchesAndRelease(e, true);
};
var executeDispatchesAndReleaseTopLevel = function executeDispatchesAndReleaseTopLevel(e) {
  return executeDispatchesAndRelease(e, false);
};

function isInteractive(tag) {
  return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
}

function shouldPreventMouseEvent(name, type, props) {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
      return !!(props.disabled && isInteractive(type));
    default:
      return false;
  }
}

var EventPluginHub = {
  injection: {
    injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName
  },

  getListener: function getListener(inst, registrationName) {
    var listener;

    if (typeof inst.tag === 'number') {
      var stateNode = inst.stateNode;
      if (!stateNode) {
        return null;
      }
      var props = EventPluginUtils.getFiberCurrentPropsFromNode(stateNode);
      if (!props) {
        return null;
      }
      listener = props[registrationName];
      if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
        return null;
      }
    } else {
      var currentElement = inst._currentElement;
      if (typeof currentElement === 'string' || typeof currentElement === 'number') {
        return null;
      }
      if (!inst._rootNodeID) {
        return null;
      }
      var _props = currentElement.props;
      listener = _props[registrationName];
      if (shouldPreventMouseEvent(registrationName, currentElement.type, _props)) {
        return null;
      }
    }

    invariant(!listener || typeof listener === 'function', 'Expected %s listener to be a function, instead got type %s', registrationName, typeof listener);
    return listener;
  },

  extractEvents: function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var events;
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0; i < plugins.length; i++) {
      var possiblePlugin = plugins[i];
      if (possiblePlugin) {
        var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
        if (extractedEvents) {
          events = accumulateInto(events, extractedEvents);
        }
      }
    }
    return events;
  },

  enqueueEvents: function enqueueEvents(events) {
    if (events) {
      eventQueue = accumulateInto(eventQueue, events);
    }
  },

  processEventQueue: function processEventQueue(simulated) {
    var processingEventQueue = eventQueue;
    eventQueue = null;
    if (simulated) {
      forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
    } else {
      forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
    }
    invariant(!eventQueue, 'processEventQueue(): Additional events were enqueued while processing ' + 'an event queue. Support for this has not yet been implemented.');

    ReactErrorUtils.rethrowCaughtError();
  }
};

module.exports = EventPluginHub;