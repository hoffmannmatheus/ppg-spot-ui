Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = babelHelpers.interopRequireDefault(_ParseObject2);

var Installation = function (_ParseObject) {
  babelHelpers.inherits(Installation, _ParseObject);

  function Installation(attributes) {
    babelHelpers.classCallCheck(this, Installation);

    var _this = babelHelpers.possibleConstructorReturn(this, (Installation.__proto__ || Object.getPrototypeOf(Installation)).call(this, '_Installation'));

    if (attributes && typeof attributes === 'object') {
      if (!_this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
    return _this;
  }

  return Installation;
}(_ParseObject3.default);

exports.default = Installation;


_ParseObject3.default.registerSubclass('_Installation', Installation);