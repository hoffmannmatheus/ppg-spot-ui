Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ParseRole = require('./ParseRole');

var _ParseRole2 = babelHelpers.interopRequireDefault(_ParseRole);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = babelHelpers.interopRequireDefault(_ParseUser);

var PUBLIC_KEY = '*';

var ParseACL = function () {
  function ParseACL(arg1) {
    babelHelpers.classCallCheck(this, ParseACL);

    this.permissionsById = {};
    if (arg1 && typeof arg1 === 'object') {
      if (arg1 instanceof _ParseUser2.default) {
        this.setReadAccess(arg1, true);
        this.setWriteAccess(arg1, true);
      } else {
        for (var userId in arg1) {
          var accessList = arg1[userId];
          if (typeof userId !== 'string') {
            throw new TypeError('Tried to create an ACL with an invalid user id.');
          }
          this.permissionsById[userId] = {};
          for (var permission in accessList) {
            var allowed = accessList[permission];
            if (permission !== 'read' && permission !== 'write') {
              throw new TypeError('Tried to create an ACL with an invalid permission type.');
            }
            if (typeof allowed !== 'boolean') {
              throw new TypeError('Tried to create an ACL with an invalid permission value.');
            }
            this.permissionsById[userId][permission] = allowed;
          }
        }
      }
    } else if (typeof arg1 === 'function') {
      throw new TypeError('ParseACL constructed with a function. Did you forget ()?');
    }
  }

  babelHelpers.createClass(ParseACL, [{
    key: 'toJSON',
    value: function toJSON() {
      var permissions = {};
      for (var p in this.permissionsById) {
        permissions[p] = this.permissionsById[p];
      }
      return permissions;
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (!(other instanceof ParseACL)) {
        return false;
      }
      var users = Object.keys(this.permissionsById);
      var otherUsers = Object.keys(other.permissionsById);
      if (users.length !== otherUsers.length) {
        return false;
      }
      for (var u in this.permissionsById) {
        if (!other.permissionsById[u]) {
          return false;
        }
        if (this.permissionsById[u].read !== other.permissionsById[u].read) {
          return false;
        }
        if (this.permissionsById[u].write !== other.permissionsById[u].write) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_setAccess',
    value: function _setAccess(accessType, userId, allowed) {
      if (userId instanceof _ParseUser2.default) {
        userId = userId.id;
      } else if (userId instanceof _ParseRole2.default) {
        var name = userId.getName();
        if (!name) {
          throw new TypeError('Role must have a name');
        }
        userId = 'role:' + name;
      }
      if (typeof userId !== 'string') {
        throw new TypeError('userId must be a string.');
      }
      if (typeof allowed !== 'boolean') {
        throw new TypeError('allowed must be either true or false.');
      }
      var permissions = this.permissionsById[userId];
      if (!permissions) {
        if (!allowed) {
          return;
        } else {
          permissions = {};
          this.permissionsById[userId] = permissions;
        }
      }

      if (allowed) {
        this.permissionsById[userId][accessType] = true;
      } else {
        delete permissions[accessType];
        if (Object.keys(permissions).length === 0) {
          delete this.permissionsById[userId];
        }
      }
    }
  }, {
    key: '_getAccess',
    value: function _getAccess(accessType, userId) {
      if (userId instanceof _ParseUser2.default) {
        userId = userId.id;
        if (!userId) {
          throw new Error('Cannot get access for a ParseUser without an ID');
        }
      } else if (userId instanceof _ParseRole2.default) {
        var name = userId.getName();
        if (!name) {
          throw new TypeError('Role must have a name');
        }
        userId = 'role:' + name;
      }
      var permissions = this.permissionsById[userId];
      if (!permissions) {
        return false;
      }
      return !!permissions[accessType];
    }
  }, {
    key: 'setReadAccess',
    value: function setReadAccess(userId, allowed) {
      this._setAccess('read', userId, allowed);
    }
  }, {
    key: 'getReadAccess',
    value: function getReadAccess(userId) {
      return this._getAccess('read', userId);
    }
  }, {
    key: 'setWriteAccess',
    value: function setWriteAccess(userId, allowed) {
      this._setAccess('write', userId, allowed);
    }
  }, {
    key: 'getWriteAccess',
    value: function getWriteAccess(userId) {
      return this._getAccess('write', userId);
    }
  }, {
    key: 'setPublicReadAccess',
    value: function setPublicReadAccess(allowed) {
      this.setReadAccess(PUBLIC_KEY, allowed);
    }
  }, {
    key: 'getPublicReadAccess',
    value: function getPublicReadAccess() {
      return this.getReadAccess(PUBLIC_KEY);
    }
  }, {
    key: 'setPublicWriteAccess',
    value: function setPublicWriteAccess(allowed) {
      this.setWriteAccess(PUBLIC_KEY, allowed);
    }
  }, {
    key: 'getPublicWriteAccess',
    value: function getPublicWriteAccess() {
      return this.getWriteAccess(PUBLIC_KEY);
    }
  }, {
    key: 'getRoleReadAccess',
    value: function getRoleReadAccess(role) {
      if (role instanceof _ParseRole2.default) {
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      return this.getReadAccess('role:' + role);
    }
  }, {
    key: 'getRoleWriteAccess',
    value: function getRoleWriteAccess(role) {
      if (role instanceof _ParseRole2.default) {
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      return this.getWriteAccess('role:' + role);
    }
  }, {
    key: 'setRoleReadAccess',
    value: function setRoleReadAccess(role, allowed) {
      if (role instanceof _ParseRole2.default) {
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      this.setReadAccess('role:' + role, allowed);
    }
  }, {
    key: 'setRoleWriteAccess',
    value: function setRoleWriteAccess(role, allowed) {
      if (role instanceof _ParseRole2.default) {
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      this.setWriteAccess('role:' + role, allowed);
    }
  }]);
  return ParseACL;
}();

exports.default = ParseACL;