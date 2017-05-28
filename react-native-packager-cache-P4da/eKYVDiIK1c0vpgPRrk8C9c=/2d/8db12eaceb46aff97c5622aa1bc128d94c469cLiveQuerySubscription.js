Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventEmitter2 = require('./EventEmitter');

var _EventEmitter3 = babelHelpers.interopRequireDefault(_EventEmitter2);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var Subscription = function (_EventEmitter) {
  babelHelpers.inherits(Subscription, _EventEmitter);

  function Subscription(id, query, sessionToken) {
    babelHelpers.classCallCheck(this, Subscription);

    var _this2 = babelHelpers.possibleConstructorReturn(this, (Subscription.__proto__ || Object.getPrototypeOf(Subscription)).call(this));

    _this2.id = id;
    _this2.query = query;
    _this2.sessionToken = sessionToken;
    return _this2;
  }

  babelHelpers.createClass(Subscription, [{
    key: 'unsubscribe',
    value: function unsubscribe() {
      var _this3 = this;

      var _this = this;
      _CoreManager2.default.getLiveQueryController().getDefaultLiveQueryClient().then(function (liveQueryClient) {
        liveQueryClient.unsubscribe(_this);
        _this.emit('close');
        _this3.resolve();
      });
    }
  }]);
  return Subscription;
}(_EventEmitter3.default);

exports.default = Subscription;