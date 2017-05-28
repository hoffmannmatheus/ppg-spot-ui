Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventEmitter2 = require('./EventEmitter');

var _EventEmitter3 = babelHelpers.interopRequireDefault(_EventEmitter2);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

var _LiveQuerySubscription = require('./LiveQuerySubscription');

var _LiveQuerySubscription2 = babelHelpers.interopRequireDefault(_LiveQuerySubscription);

var CLIENT_STATE = {
  INITIALIZED: 'initialized',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected'
};

var OP_TYPES = {
  CONNECT: 'connect',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  ERROR: 'error'
};

var OP_EVENTS = {
  CONNECTED: 'connected',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete'
};

var CLIENT_EMMITER_TYPES = {
  CLOSE: 'close',
  ERROR: 'error',
  OPEN: 'open'
};

var SUBSCRIPTION_EMMITER_TYPES = {
  OPEN: 'open',
  CLOSE: 'close',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete'
};

var generateInterval = function generateInterval(k) {
  return Math.random() * Math.min(30, Math.pow(2, k) - 1) * 1000;
};

var LiveQueryClient = function (_EventEmitter) {
  babelHelpers.inherits(LiveQueryClient, _EventEmitter);

  function LiveQueryClient(_ref) {
    var applicationId = _ref.applicationId,
        serverURL = _ref.serverURL,
        javascriptKey = _ref.javascriptKey,
        masterKey = _ref.masterKey,
        sessionToken = _ref.sessionToken;
    babelHelpers.classCallCheck(this, LiveQueryClient);

    var _this = babelHelpers.possibleConstructorReturn(this, (LiveQueryClient.__proto__ || Object.getPrototypeOf(LiveQueryClient)).call(this));

    if (!serverURL || serverURL.indexOf('ws') !== 0) {
      throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
    }

    _this.reconnectHandle = null;
    _this.attempts = 1;;
    _this.id = 0;
    _this.requestId = 1;
    _this.serverURL = serverURL;
    _this.applicationId = applicationId;
    _this.javascriptKey = javascriptKey;
    _this.masterKey = masterKey;
    _this.sessionToken = sessionToken;
    _this.connectPromise = new _ParsePromise2.default();
    _this.subscriptions = new Map();
    _this.state = CLIENT_STATE.INITIALIZED;
    return _this;
  }

  babelHelpers.createClass(LiveQueryClient, [{
    key: 'shouldOpen',
    value: function shouldOpen() {
      return this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED;
    }
  }, {
    key: 'subscribe',
    value: function subscribe(query, sessionToken) {
      var _this2 = this;

      if (!query) {
        return;
      }
      var where = query.toJSON().where;
      var className = query.className;
      var subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId: this.requestId,
        query: {
          className: className,
          where: where
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      var subscription = new _LiveQuerySubscription2.default(this.requestId, query, sessionToken);
      this.subscriptions.set(this.requestId, subscription);
      this.requestId += 1;
      this.connectPromise.then(function () {
        _this2.socket.send(JSON.stringify(subscribeRequest));
      });

      subscription.on('error', function () {});

      return subscription;
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe(subscription) {
      var _this3 = this;

      if (!subscription) {
        return;
      }

      this.subscriptions.delete(subscription.id);
      var unsubscribeRequest = {
        op: OP_TYPES.UNSUBSCRIBE,
        requestId: subscription.id
      };
      this.connectPromise.then(function () {
        _this3.socket.send(JSON.stringify(unsubscribeRequest));
      });
    }
  }, {
    key: 'open',
    value: function open() {
      var _this4 = this;

      var WebSocketImplementation = this._getWebSocketImplementation();
      if (!WebSocketImplementation) {
        this.emit(CLIENT_EMMITER_TYPES.ERROR, 'Can not find WebSocket implementation');
        return;
      }

      if (this.state !== CLIENT_STATE.RECONNECTING) {
        this.state = CLIENT_STATE.CONNECTING;
      }

      this.socket = new WebSocketImplementation(this.serverURL);

      this.socket.onopen = function () {
        _this4._handleWebSocketOpen();
      };

      this.socket.onmessage = function (event) {
        _this4._handleWebSocketMessage(event);
      };

      this.socket.onclose = function () {
        _this4._handleWebSocketClose();
      };

      this.socket.onerror = function (error) {
        _this4._handleWebSocketError(error);
      };
    }
  }, {
    key: 'resubscribe',
    value: function resubscribe() {
      var _this5 = this;

      this.subscriptions.forEach(function (subscription, requestId) {
        var query = subscription.query;
        var where = query.toJSON().where;
        var className = query.className;
        var sessionToken = subscription.sessionToken;
        var subscribeRequest = {
          op: OP_TYPES.SUBSCRIBE,
          requestId: requestId,
          query: {
            className: className,
            where: where
          }
        };

        if (sessionToken) {
          subscribeRequest.sessionToken = sessionToken;
        }

        _this5.connectPromise.then(function () {
          _this5.socket.send(JSON.stringify(subscribeRequest));
        });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED) {
        return;
      }
      this.state = CLIENT_STATE.DISCONNECTED;
      this.socket.close();

      for (var _iterator = this.subscriptions.values(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']();;) {
        var _ref2;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref2 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref2 = _i.value;
        }

        var subscription = _ref2;

        subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
      }
      this._handleReset();
      this.emit(CLIENT_EMMITER_TYPES.CLOSE);
    }
  }, {
    key: '_getWebSocketImplementation',
    value: function _getWebSocketImplementation() {
      return WebSocket;
    }
  }, {
    key: '_handleReset',
    value: function _handleReset() {
      this.attempts = 1;;
      this.id = 0;
      this.requestId = 1;
      this.connectPromise = new _ParsePromise2.default();
      this.subscriptions = new Map();
    }
  }, {
    key: '_handleWebSocketOpen',
    value: function _handleWebSocketOpen() {
      this.attempts = 1;
      var connectRequest = {
        op: OP_TYPES.CONNECT,
        applicationId: this.applicationId,
        javascriptKey: this.javascriptKey,
        masterKey: this.masterKey,
        sessionToken: this.sessionToken
      };
      this.socket.send(JSON.stringify(connectRequest));
    }
  }, {
    key: '_handleWebSocketMessage',
    value: function _handleWebSocketMessage(event) {
      var data = event.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      var subscription = null;
      if (data.requestId) {
        subscription = this.subscriptions.get(data.requestId);
      }
      switch (data.op) {
        case OP_EVENTS.CONNECTED:
          if (this.state === CLIENT_STATE.RECONNECTING) {
            this.resubscribe();
          }
          this.emit(CLIENT_EMMITER_TYPES.OPEN);
          this.id = data.clientId;
          this.connectPromise.resolve();
          this.state = CLIENT_STATE.CONNECTED;
          break;
        case OP_EVENTS.SUBSCRIBED:
          if (subscription) {
            subscription.emit(SUBSCRIPTION_EMMITER_TYPES.OPEN);
          }
          break;
        case OP_EVENTS.ERROR:
          if (data.requestId) {
            if (subscription) {
              subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR, data.error);
            }
          } else {
            this.emit(CLIENT_EMMITER_TYPES.ERROR, data.error);
          }
          break;
        case OP_EVENTS.UNSUBSCRIBED:
          break;
        default:
          var className = data.object.className;

          delete data.object.__type;
          delete data.object.className;
          var parseObject = new _ParseObject2.default(className);
          parseObject._finishFetch(data.object);
          if (!subscription) {
            break;
          }
          subscription.emit(data.op, parseObject);
      }
    }
  }, {
    key: '_handleWebSocketClose',
    value: function _handleWebSocketClose() {
      if (this.state === CLIENT_STATE.DISCONNECTED) {
        return;
      }
      this.state = CLIENT_STATE.CLOSED;
      this.emit(CLIENT_EMMITER_TYPES.CLOSE);

      for (var _iterator2 = this.subscriptions.values(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']();;) {
        var _ref3;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref3 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref3 = _i2.value;
        }

        var subscription = _ref3;

        subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
      }
      this._handleReconnect();
    }
  }, {
    key: '_handleWebSocketError',
    value: function _handleWebSocketError(error) {
      this.emit(CLIENT_EMMITER_TYPES.ERROR, error);
      for (var _iterator3 = this.subscriptions.values(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']();;) {
        var _ref4;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref4 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref4 = _i3.value;
        }

        var subscription = _ref4;

        subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR);
      }
      this._handleReconnect();
    }
  }, {
    key: '_handleReconnect',
    value: function _handleReconnect() {
      var _this6 = this;

      if (this.state === CLIENT_STATE.DISCONNECTED) {
        return;
      }

      this.state = CLIENT_STATE.RECONNECTING;
      var time = generateInterval(this.attempts);

      if (this.reconnectHandle) {
        clearTimeout(this.reconnectHandle);
      }

      this.reconnectHandle = setTimeout(function () {
        _this6.attempts++;
        _this6.connectPromise = new _ParsePromise2.default();
        _this6.open();
      }.bind(this), time);
    }
  }]);
  return LiveQueryClient;
}(_EventEmitter3.default);

exports.default = LiveQueryClient;