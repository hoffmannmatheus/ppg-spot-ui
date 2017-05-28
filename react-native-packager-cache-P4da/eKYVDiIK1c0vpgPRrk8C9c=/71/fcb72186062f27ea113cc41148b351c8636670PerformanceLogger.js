
'use strict';

var BatchedBridge = require('BatchedBridge');
var Systrace = require('Systrace');

var performanceNow = global.nativePerformanceNow || require('fbjs/lib/performanceNow');

var timespans = {};
var extras = {};
var cookies = {};

var PRINT_TO_CONSOLE = false;

var PerformanceLogger = {
  addTimespan: function addTimespan(key, lengthInMs, description) {
    if (timespans[key]) {
      if (__DEV__) {
        console.log('PerformanceLogger: Attempting to add a timespan that already exists ', key);
      }
      return;
    }

    timespans[key] = {
      description: description,
      totalTime: lengthInMs
    };
  },
  startTimespan: function startTimespan(key, description) {
    if (timespans[key]) {
      if (__DEV__) {
        console.log('PerformanceLogger: Attempting to start a timespan that already exists ', key);
      }
      return;
    }

    timespans[key] = {
      description: description,
      startTime: performanceNow()
    };
    cookies[key] = Systrace.beginAsyncEvent(key);
    if (__DEV__ && PRINT_TO_CONSOLE) {
      console.log('PerformanceLogger.js', 'start: ' + key);
    }
  },
  stopTimespan: function stopTimespan(key) {
    var timespan = timespans[key];
    if (!timespan || !timespan.startTime) {
      if (__DEV__) {
        console.log('PerformanceLogger: Attempting to end a timespan that has not started ', key);
      }
      return;
    }
    if (timespan.endTime) {
      if (__DEV__) {
        console.log('PerformanceLogger: Attempting to end a timespan that has already ended ', key);
      }
      return;
    }

    timespan.endTime = performanceNow();
    timespan.totalTime = timespan.endTime - (timespan.startTime || 0);
    if (__DEV__ && PRINT_TO_CONSOLE) {
      console.log('PerformanceLogger.js', 'end: ' + key);
    }

    Systrace.endAsyncEvent(key, cookies[key]);
    delete cookies[key];
  },
  clear: function clear() {
    timespans = {};
    extras = {};
  },
  clearCompleted: function clearCompleted() {
    for (var _key in timespans) {
      if (timespans[_key].totalTime) {
        delete timespans[_key];
      }
    }
    extras = {};
  },
  clearExceptTimespans: function clearExceptTimespans(keys) {
    timespans = Object.keys(timespans).reduce(function (previous, key) {
      if (keys.indexOf(key) !== -1) {
        previous[key] = timespans[key];
      }
      return previous;
    }, {});
    extras = {};
  },
  currentTimestamp: function currentTimestamp() {
    return performanceNow();
  },
  getTimespans: function getTimespans() {
    return timespans;
  },
  hasTimespan: function hasTimespan(key) {
    return !!timespans[key];
  },
  logTimespans: function logTimespans() {
    for (var _key2 in timespans) {
      if (timespans[_key2].totalTime) {
        console.log(_key2 + ': ' + timespans[_key2].totalTime + 'ms');
      }
    }
  },
  addTimespans: function addTimespans(newTimespans, labels) {
    for (var i = 0, l = newTimespans.length; i < l; i += 2) {
      var label = labels[i / 2];
      PerformanceLogger.addTimespan(label, newTimespans[i + 1] - newTimespans[i], label);
    }
  },
  setExtra: function setExtra(key, value) {
    if (extras[key]) {
      if (__DEV__) {
        console.log('PerformanceLogger: Attempting to set an extra that already exists ', key);
      }
      return;
    }
    extras[key] = value;
  },
  getExtras: function getExtras() {
    return extras;
  }
};

BatchedBridge.registerCallableModule('PerformanceLogger', PerformanceLogger);

module.exports = PerformanceLogger;