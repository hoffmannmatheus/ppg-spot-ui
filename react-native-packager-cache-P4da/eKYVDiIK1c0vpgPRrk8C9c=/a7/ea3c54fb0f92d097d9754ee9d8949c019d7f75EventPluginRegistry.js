

'use strict';

var invariant = require('fbjs/lib/invariant');

var eventPluginOrder = null;

var namesToPlugins = {};

function recomputePluginOrdering() {
  if (!eventPluginOrder) {
    return;
  }
  for (var pluginName in namesToPlugins) {
    var pluginModule = namesToPlugins[pluginName];
    var pluginIndex = eventPluginOrder.indexOf(pluginName);
    invariant(pluginIndex > -1, 'EventPluginRegistry: Cannot inject event plugins that do not exist in ' + 'the plugin ordering, `%s`.', pluginName);
    if (EventPluginRegistry.plugins[pluginIndex]) {
      continue;
    }
    invariant(pluginModule.extractEvents, 'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 'method, but `%s` does not.', pluginName);
    EventPluginRegistry.plugins[pluginIndex] = pluginModule;
    var publishedEvents = pluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      invariant(publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName), 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName);
    }
  }
}

function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
  invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName), 'EventPluginHub: More than one plugin attempted to publish the same ' + 'event name, `%s`.', eventName);
  EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
    return true;
  }
  return false;
}

function publishRegistrationName(registrationName, pluginModule, eventName) {
  invariant(!EventPluginRegistry.registrationNameModules[registrationName], 'EventPluginHub: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName);
  EventPluginRegistry.registrationNameModules[registrationName] = pluginModule;
  EventPluginRegistry.registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;

  if (__DEV__) {
    var lowerCasedName = registrationName.toLowerCase();
    EventPluginRegistry.possibleRegistrationNames[lowerCasedName] = registrationName;

    if (registrationName === 'onDoubleClick') {
      EventPluginRegistry.possibleRegistrationNames.ondblclick = registrationName;
    }
  }
}

var EventPluginRegistry = {
  plugins: [],

  eventNameDispatchConfigs: {},

  registrationNameModules: {},

  registrationNameDependencies: {},

  possibleRegistrationNames: __DEV__ ? {} : null,

  injectEventPluginOrder: function injectEventPluginOrder(injectedEventPluginOrder) {
    invariant(!eventPluginOrder, 'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 'once. You are likely trying to load more than one copy of React.');

    eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
    recomputePluginOrdering();
  },

  injectEventPluginsByName: function injectEventPluginsByName(injectedNamesToPlugins) {
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
      if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
        continue;
      }
      var pluginModule = injectedNamesToPlugins[pluginName];
      if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
        invariant(!namesToPlugins[pluginName], 'EventPluginRegistry: Cannot inject two different event plugins ' + 'using the same name, `%s`.', pluginName);
        namesToPlugins[pluginName] = pluginModule;
        isOrderingDirty = true;
      }
    }
    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  }
};

module.exports = EventPluginRegistry;