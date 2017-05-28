Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ParseACL = require('./ParseACL');

var _ParseACL2 = babelHelpers.interopRequireDefault(_ParseACL);

var _ParseError = require('./ParseError');

var _ParseError2 = babelHelpers.interopRequireDefault(_ParseError);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = babelHelpers.interopRequireDefault(_ParseObject2);

var ParseRole = function (_ParseObject) {
  babelHelpers.inherits(ParseRole, _ParseObject);

  function ParseRole(name, acl) {
    babelHelpers.classCallCheck(this, ParseRole);

    var _this = babelHelpers.possibleConstructorReturn(this, (ParseRole.__proto__ || Object.getPrototypeOf(ParseRole)).call(this, '_Role'));

    if (typeof name === 'string' && acl instanceof _ParseACL2.default) {
      _this.setName(name);
      _this.setACL(acl);
    }
    return _this;
  }

  babelHelpers.createClass(ParseRole, [{
    key: 'getName',
    value: function getName() {
      var name = this.get('name');
      if (name == null || typeof name === 'string') {
        return name;
      }
      return '';
    }
  }, {
    key: 'setName',
    value: function setName(name, options) {
      return this.set('name', name, options);
    }
  }, {
    key: 'getUsers',
    value: function getUsers() {
      return this.relation('users');
    }
  }, {
    key: 'getRoles',
    value: function getRoles() {
      return this.relation('roles');
    }
  }, {
    key: 'validate',
    value: function validate(attrs, options) {
      var isInvalid = babelHelpers.get(ParseRole.prototype.__proto__ || Object.getPrototypeOf(ParseRole.prototype), 'validate', this).call(this, attrs, options);
      if (isInvalid) {
        return isInvalid;
      }

      if ('name' in attrs && attrs.name !== this.getName()) {
        var newName = attrs.name;
        if (this.id && this.id !== attrs.objectId) {
          return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'A role\'s name can only be set before it has been saved.');
        }
        if (typeof newName !== 'string') {
          return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'A role\'s name must be a String.');
        }
        if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
          return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'A role\'s name can be only contain alphanumeric characters, _, ' + '-, and spaces.');
        }
      }
      return false;
    }
  }]);
  return ParseRole;
}(_ParseObject3.default);

exports.default = ParseRole;


_ParseObject3.default.registerSubclass('_Role', ParseRole);