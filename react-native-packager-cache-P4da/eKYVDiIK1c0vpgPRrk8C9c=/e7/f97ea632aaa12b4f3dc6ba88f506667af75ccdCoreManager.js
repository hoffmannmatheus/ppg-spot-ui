

var config = {
  IS_NODE: typeof process !== 'undefined' && !!process.versions && !!process.versions.node && !process.versions.electron,
  REQUEST_ATTEMPT_LIMIT: 5,
  SERVER_URL: 'https://api.parse.com/1',
  LIVEQUERY_SERVER_URL: null,
  VERSION: 'js' + '1.9.2',
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false
};

function requireMethods(name, methods, controller) {
  methods.forEach(function (func) {
    if (typeof controller[func] !== 'function') {
      throw new Error(name + ' must implement ' + func + '()');
    }
  });
}

module.exports = {
  get: function get(key) {
    if (config.hasOwnProperty(key)) {
      return config[key];
    }
    throw new Error('Configuration key not found: ' + key);
  },

  set: function set(key, value) {
    config[key] = value;
  },

  setAnalyticsController: function setAnalyticsController(controller) {
    requireMethods('AnalyticsController', ['track'], controller);
    config['AnalyticsController'] = controller;
  },
  getAnalyticsController: function getAnalyticsController() {
    return config['AnalyticsController'];
  },
  setCloudController: function setCloudController(controller) {
    requireMethods('CloudController', ['run'], controller);
    config['CloudController'] = controller;
  },
  getCloudController: function getCloudController() {
    return config['CloudController'];
  },
  setConfigController: function setConfigController(controller) {
    requireMethods('ConfigController', ['current', 'get'], controller);
    config['ConfigController'] = controller;
  },
  getConfigController: function getConfigController() {
    return config['ConfigController'];
  },
  setFileController: function setFileController(controller) {
    requireMethods('FileController', ['saveFile', 'saveBase64'], controller);
    config['FileController'] = controller;
  },
  getFileController: function getFileController() {
    return config['FileController'];
  },
  setInstallationController: function setInstallationController(controller) {
    requireMethods('InstallationController', ['currentInstallationId'], controller);
    config['InstallationController'] = controller;
  },
  getInstallationController: function getInstallationController() {
    return config['InstallationController'];
  },
  setObjectController: function setObjectController(controller) {
    requireMethods('ObjectController', ['save', 'fetch', 'destroy'], controller);
    config['ObjectController'] = controller;
  },
  getObjectController: function getObjectController() {
    return config['ObjectController'];
  },
  setObjectStateController: function setObjectStateController(controller) {
    requireMethods('ObjectStateController', ['getState', 'initializeState', 'removeState', 'getServerData', 'setServerData', 'getPendingOps', 'setPendingOp', 'pushPendingState', 'popPendingState', 'mergeFirstPendingState', 'getObjectCache', 'estimateAttribute', 'estimateAttributes', 'commitServerChanges', 'enqueueTask', 'clearAllState'], controller);

    config['ObjectStateController'] = controller;
  },
  getObjectStateController: function getObjectStateController() {
    return config['ObjectStateController'];
  },
  setPushController: function setPushController(controller) {
    requireMethods('PushController', ['send'], controller);
    config['PushController'] = controller;
  },
  getPushController: function getPushController() {
    return config['PushController'];
  },
  setQueryController: function setQueryController(controller) {
    requireMethods('QueryController', ['find'], controller);
    config['QueryController'] = controller;
  },
  getQueryController: function getQueryController() {
    return config['QueryController'];
  },
  setRESTController: function setRESTController(controller) {
    requireMethods('RESTController', ['request', 'ajax'], controller);
    config['RESTController'] = controller;
  },
  getRESTController: function getRESTController() {
    return config['RESTController'];
  },
  setSessionController: function setSessionController(controller) {
    requireMethods('SessionController', ['getSession'], controller);
    config['SessionController'] = controller;
  },
  getSessionController: function getSessionController() {
    return config['SessionController'];
  },
  setStorageController: function setStorageController(controller) {
    if (controller.async) {
      requireMethods('An async StorageController', ['getItemAsync', 'setItemAsync', 'removeItemAsync'], controller);
    } else {
      requireMethods('A synchronous StorageController', ['getItem', 'setItem', 'removeItem'], controller);
    }
    config['StorageController'] = controller;
  },
  getStorageController: function getStorageController() {
    return config['StorageController'];
  },
  setUserController: function setUserController(controller) {
    requireMethods('UserController', ['setCurrentUser', 'currentUser', 'currentUserAsync', 'signUp', 'logIn', 'become', 'logOut', 'requestPasswordReset', 'upgradeToRevocableSession', 'linkWith'], controller);
    config['UserController'] = controller;
  },
  getUserController: function getUserController() {
    return config['UserController'];
  },
  setLiveQueryController: function setLiveQueryController(controller) {
    requireMethods('LiveQueryController', ['subscribe', 'unsubscribe', 'open', 'close'], controller);
    config['LiveQueryController'] = controller;
  },
  getLiveQueryController: function getLiveQueryController() {
    return config['LiveQueryController'];
  },
  setHooksController: function setHooksController(controller) {
    requireMethods('HooksController', ['create', 'get', 'update', 'remove'], controller);
    config['HooksController'] = controller;
  },
  getHooksController: function getHooksController() {
    return config['HooksController'];
  }
};