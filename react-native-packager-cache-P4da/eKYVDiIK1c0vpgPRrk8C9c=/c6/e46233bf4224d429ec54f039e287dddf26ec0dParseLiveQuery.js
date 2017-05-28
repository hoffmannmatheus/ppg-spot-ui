Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventEmitter = require('./EventEmitter');

var _EventEmitter2 = babelHelpers.interopRequireDefault(_EventEmitter);

var _LiveQueryClient = require('./LiveQueryClient');

var _LiveQueryClient2 = babelHelpers.interopRequireDefault(_LiveQueryClient);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

function open() {
  var LiveQueryController = _CoreManager2.default.getLiveQueryController();
  LiveQueryController.open();
}

function close() {
  var LiveQueryController = _CoreManager2.default.getLiveQueryController();
  LiveQueryController.close();
}

var LiveQuery = new _EventEmitter2.default();

LiveQuery.open = open;

LiveQuery.close = close;

LiveQuery.on('error', function () {});

exports.default = LiveQuery;


function getSessionToken() {
  var controller = _CoreManager2.default.getUserController();
  return controller.currentUserAsync().then(function (currentUser) {
    return currentUser ? currentUser.getSessionToken() : undefined;
  });
}

function getLiveQueryClient() {
  return _CoreManager2.default.getLiveQueryController().getDefaultLiveQueryClient();
}

var defaultLiveQueryClient = void 0;
var DefaultLiveQueryController = {
  setDefaultLiveQueryClient: function setDefaultLiveQueryClient(liveQueryClient) {
    defaultLiveQueryClient = liveQueryClient;
  },
  getDefaultLiveQueryClient: function getDefaultLiveQueryClient() {
    if (defaultLiveQueryClient) {
      return _ParsePromise2.default.as(defaultLiveQueryClient);
    }

    return getSessionToken().then(function (sessionToken) {
      var liveQueryServerURL = _CoreManager2.default.get('LIVEQUERY_SERVER_URL');

      if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
        throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
      }

      if (!liveQueryServerURL) {
        var tempServerURL = _CoreManager2.default.get('SERVER_URL');
        var protocol = 'ws://';

        if (tempServerURL.indexOf('https') === 0) {
          protocol = 'wss://';
        }
        var host = tempServerURL.replace(/^https?:\/\//, '');
        liveQueryServerURL = protocol + host;
        _CoreManager2.default.set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
      }

      var applicationId = _CoreManager2.default.get('APPLICATION_ID');
      var javascriptKey = _CoreManager2.default.get('JAVASCRIPT_KEY');
      var masterKey = _CoreManager2.default.get('MASTER_KEY');

      defaultLiveQueryClient = new _LiveQueryClient2.default({
        applicationId: applicationId,
        serverURL: liveQueryServerURL,
        javascriptKey: javascriptKey,
        masterKey: masterKey,
        sessionToken: sessionToken
      });

      defaultLiveQueryClient.on('error', function (error) {
        LiveQuery.emit('error', error);
      });
      defaultLiveQueryClient.on('open', function () {
        LiveQuery.emit('open');
      });
      defaultLiveQueryClient.on('close', function () {
        LiveQuery.emit('close');
      });

      return defaultLiveQueryClient;
    });
  },
  open: function open() {
    var _this = this;

    getLiveQueryClient().then(function (liveQueryClient) {
      _this.resolve(liveQueryClient.open());
    });
  },
  close: function close() {
    var _this2 = this;

    getLiveQueryClient().then(function (liveQueryClient) {
      _this2.resolve(liveQueryClient.close());
    });
  },
  subscribe: function subscribe(query) {
    var _this3 = this;

    var subscriptionWrap = new _EventEmitter2.default();

    getLiveQueryClient().then(function (liveQueryClient) {
      if (liveQueryClient.shouldOpen()) {
        liveQueryClient.open();
      }
      var promiseSessionToken = getSessionToken();

      return promiseSessionToken.then(function (sessionToken) {

        var subscription = liveQueryClient.subscribe(query, sessionToken);


        subscriptionWrap.id = subscription.id;
        subscriptionWrap.query = subscription.query;
        subscriptionWrap.sessionToken = subscription.sessionToken;
        subscriptionWrap.unsubscribe = subscription.unsubscribe;

        subscription.on('open', function () {
          subscriptionWrap.emit('open');
        });
        subscription.on('create', function (object) {
          subscriptionWrap.emit('create', object);
        });
        subscription.on('update', function (object) {
          subscriptionWrap.emit('update', object);
        });
        subscription.on('enter', function (object) {
          subscriptionWrap.emit('enter', object);
        });
        subscription.on('leave', function (object) {
          subscriptionWrap.emit('leave', object);
        });
        subscription.on('delete', function (object) {
          subscriptionWrap.emit('delete', object);
        });

        _this3.resolve();
      });
    });
    return subscriptionWrap;
  },
  unsubscribe: function unsubscribe(subscription) {
    var _this4 = this;

    getLiveQueryClient().then(function (liveQueryClient) {
      _this4.resolve(liveQueryClient.unsubscribe(subscription));
    });
  },
  _clearCachedDefaultClient: function _clearCachedDefaultClient() {
    defaultLiveQueryClient = null;
  }
};

_CoreManager2.default.setLiveQueryController(DefaultLiveQueryController);