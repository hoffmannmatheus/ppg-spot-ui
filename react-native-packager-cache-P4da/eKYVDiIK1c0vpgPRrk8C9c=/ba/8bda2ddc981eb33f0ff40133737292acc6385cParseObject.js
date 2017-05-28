Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _canBeSerialized = require('./canBeSerialized');

var _canBeSerialized2 = babelHelpers.interopRequireDefault(_canBeSerialized);

var _decode = require('./decode');

var _decode2 = babelHelpers.interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _equals = require('./equals');

var _equals2 = babelHelpers.interopRequireDefault(_equals);

var _escape2 = require('./escape');

var _escape3 = babelHelpers.interopRequireDefault(_escape2);

var _ParseACL = require('./ParseACL');

var _ParseACL2 = babelHelpers.interopRequireDefault(_ParseACL);

var _parseDate = require('./parseDate');

var _parseDate2 = babelHelpers.interopRequireDefault(_parseDate);

var _ParseError = require('./ParseError');

var _ParseError2 = babelHelpers.interopRequireDefault(_ParseError);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = babelHelpers.interopRequireDefault(_ParseFile);

var _ParseOp = require('./ParseOp');

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = babelHelpers.interopRequireDefault(_ParseQuery);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = babelHelpers.interopRequireDefault(_ParseRelation);

var _SingleInstanceStateController = require('./SingleInstanceStateController');

var SingleInstanceStateController = babelHelpers.interopRequireWildcard(_SingleInstanceStateController);

var _unique = require('./unique');

var _unique2 = babelHelpers.interopRequireDefault(_unique);

var _UniqueInstanceStateController = require('./UniqueInstanceStateController');

var UniqueInstanceStateController = babelHelpers.interopRequireWildcard(_UniqueInstanceStateController);

var _unsavedChildren = require('./unsavedChildren');

var _unsavedChildren2 = babelHelpers.interopRequireDefault(_unsavedChildren);

var classMap = {};

var localCount = 0;

var objectCount = 0;

var singleInstance = !_CoreManager2.default.get('IS_NODE');
if (singleInstance) {
  _CoreManager2.default.setObjectStateController(SingleInstanceStateController);
} else {
  _CoreManager2.default.setObjectStateController(UniqueInstanceStateController);
}

function getServerUrlPath() {
  var serverUrl = _CoreManager2.default.get('SERVER_URL');
  if (serverUrl[serverUrl.length - 1] !== '/') {
    serverUrl += '/';
  }
  var url = serverUrl.replace(/https?:\/\//, '');
  return url.substr(url.indexOf('/'));
}

var ParseObject = function () {
  function ParseObject(className, attributes, options) {
    babelHelpers.classCallCheck(this, ParseObject);

    if (typeof this.initialize === 'function') {
      this.initialize.apply(this, arguments);
    }

    var toSet = null;
    this._objCount = objectCount++;
    if (typeof className === 'string') {
      this.className = className;
      if (attributes && typeof attributes === 'object') {
        toSet = attributes;
      }
    } else if (className && typeof className === 'object') {
      this.className = className.className;
      toSet = {};
      for (var attr in className) {
        if (attr !== 'className') {
          toSet[attr] = className[attr];
        }
      }
      if (attributes && typeof attributes === 'object') {
        options = attributes;
      }
    }
    if (toSet && !this.set(toSet, options)) {
      throw new Error('Can\'t create an invalid Parse Object');
    }
  }

  babelHelpers.createClass(ParseObject, [{
    key: '_getId',
    value: function _getId() {
      if (typeof this.id === 'string') {
        return this.id;
      }
      if (typeof this._localId === 'string') {
        return this._localId;
      }
      var localId = 'local' + String(localCount++);
      this._localId = localId;
      return localId;
    }
  }, {
    key: '_getStateIdentifier',
    value: function _getStateIdentifier() {
      if (singleInstance) {
        var id = this.id;
        if (!id) {
          id = this._getId();
        }
        return {
          id: id,
          className: this.className
        };
      } else {
        return this;
      }
    }
  }, {
    key: '_getServerData',
    value: function _getServerData() {
      var stateController = _CoreManager2.default.getObjectStateController();
      return stateController.getServerData(this._getStateIdentifier());
    }
  }, {
    key: '_clearServerData',
    value: function _clearServerData() {
      var serverData = this._getServerData();
      var unset = {};
      for (var attr in serverData) {
        unset[attr] = undefined;
      }
      var stateController = _CoreManager2.default.getObjectStateController();
      stateController.setServerData(this._getStateIdentifier(), unset);
    }
  }, {
    key: '_getPendingOps',
    value: function _getPendingOps() {
      var stateController = _CoreManager2.default.getObjectStateController();
      return stateController.getPendingOps(this._getStateIdentifier());
    }
  }, {
    key: '_clearPendingOps',
    value: function _clearPendingOps() {
      var pending = this._getPendingOps();
      var latest = pending[pending.length - 1];
      var keys = Object.keys(latest);
      keys.forEach(function (key) {
        delete latest[key];
      });
    }
  }, {
    key: '_getDirtyObjectAttributes',
    value: function _getDirtyObjectAttributes() {
      var attributes = this.attributes;
      var stateController = _CoreManager2.default.getObjectStateController();
      var objectCache = stateController.getObjectCache(this._getStateIdentifier());
      var dirty = {};
      for (var attr in attributes) {
        var val = attributes[attr];
        if (val && typeof val === 'object' && !(val instanceof ParseObject) && !(val instanceof _ParseFile2.default) && !(val instanceof _ParseRelation2.default)) {
          try {
            var json = (0, _encode2.default)(val, false, true);
            var stringified = JSON.stringify(json);
            if (objectCache[attr] !== stringified) {
              dirty[attr] = val;
            }
          } catch (e) {
            dirty[attr] = val;
          }
        }
      }
      return dirty;
    }
  }, {
    key: '_toFullJSON',
    value: function _toFullJSON(seen) {
      var json = this.toJSON(seen);
      json.__type = 'Object';
      json.className = this.className;
      return json;
    }
  }, {
    key: '_getSaveJSON',
    value: function _getSaveJSON() {
      var pending = this._getPendingOps();
      var dirtyObjects = this._getDirtyObjectAttributes();
      var json = {};

      for (var attr in dirtyObjects) {
        json[attr] = new _ParseOp.SetOp(dirtyObjects[attr]).toJSON();
      }
      for (attr in pending[0]) {
        json[attr] = pending[0][attr].toJSON();
      }
      return json;
    }
  }, {
    key: '_getSaveParams',
    value: function _getSaveParams() {
      var method = this.id ? 'PUT' : 'POST';
      var body = this._getSaveJSON();
      var path = 'classes/' + this.className;
      if (this.id) {
        path += '/' + this.id;
      } else if (this.className === '_User') {
        path = 'users';
      }
      return {
        method: method,
        body: body,
        path: path
      };
    }
  }, {
    key: '_finishFetch',
    value: function _finishFetch(serverData) {
      if (!this.id && serverData.objectId) {
        this.id = serverData.objectId;
      }
      var stateController = _CoreManager2.default.getObjectStateController();
      stateController.initializeState(this._getStateIdentifier());
      var decoded = {};
      for (var attr in serverData) {
        if (attr === 'ACL') {
          decoded[attr] = new _ParseACL2.default(serverData[attr]);
        } else if (attr !== 'objectId') {
          decoded[attr] = (0, _decode2.default)(serverData[attr]);
          if (decoded[attr] instanceof _ParseRelation2.default) {
            decoded[attr]._ensureParentAndKey(this, attr);
          }
        }
      }
      if (decoded.createdAt && typeof decoded.createdAt === 'string') {
        decoded.createdAt = (0, _parseDate2.default)(decoded.createdAt);
      }
      if (decoded.updatedAt && typeof decoded.updatedAt === 'string') {
        decoded.updatedAt = (0, _parseDate2.default)(decoded.updatedAt);
      }
      if (!decoded.updatedAt && decoded.createdAt) {
        decoded.updatedAt = decoded.createdAt;
      }
      stateController.commitServerChanges(this._getStateIdentifier(), decoded);
    }
  }, {
    key: '_setExisted',
    value: function _setExisted(existed) {
      var stateController = _CoreManager2.default.getObjectStateController();
      var state = stateController.getState(this._getStateIdentifier());
      if (state) {
        state.existed = existed;
      }
    }
  }, {
    key: '_migrateId',
    value: function _migrateId(serverId) {
      if (this._localId && serverId) {
        if (singleInstance) {
          var stateController = _CoreManager2.default.getObjectStateController();
          var oldState = stateController.removeState(this._getStateIdentifier());
          this.id = serverId;
          delete this._localId;
          if (oldState) {
            stateController.initializeState(this._getStateIdentifier(), oldState);
          }
        } else {
          this.id = serverId;
          delete this._localId;
        }
      }
    }
  }, {
    key: '_handleSaveResponse',
    value: function _handleSaveResponse(response, status) {
      var changes = {};

      var stateController = _CoreManager2.default.getObjectStateController();
      var pending = stateController.popPendingState(this._getStateIdentifier());
      for (var attr in pending) {
        if (pending[attr] instanceof _ParseOp.RelationOp) {
          changes[attr] = pending[attr].applyTo(undefined, this, attr);
        } else if (!(attr in response)) {
          changes[attr] = pending[attr].applyTo(undefined);
        }
      }
      for (attr in response) {
        if ((attr === 'createdAt' || attr === 'updatedAt') && typeof response[attr] === 'string') {
          changes[attr] = (0, _parseDate2.default)(response[attr]);
        } else if (attr === 'ACL') {
          changes[attr] = new _ParseACL2.default(response[attr]);
        } else if (attr !== 'objectId') {
          changes[attr] = (0, _decode2.default)(response[attr]);
          if (changes[attr] instanceof _ParseOp.UnsetOp) {
            changes[attr] = undefined;
          }
        }
      }
      if (changes.createdAt && !changes.updatedAt) {
        changes.updatedAt = changes.createdAt;
      }

      this._migrateId(response.objectId);

      if (status !== 201) {
        this._setExisted(true);
      }

      stateController.commitServerChanges(this._getStateIdentifier(), changes);
    }
  }, {
    key: '_handleSaveError',
    value: function _handleSaveError() {
      this._getPendingOps();

      var stateController = _CoreManager2.default.getObjectStateController();
      stateController.mergeFirstPendingState(this._getStateIdentifier());
    }
  }, {
    key: 'initialize',
    value: function initialize() {}
  }, {
    key: 'toJSON',
    value: function toJSON(seen) {
      var seenEntry = this.id ? this.className + ':' + this.id : this;
      var seen = seen || [seenEntry];
      var json = {};
      var attrs = this.attributes;
      for (var attr in attrs) {
        if ((attr === 'createdAt' || attr === 'updatedAt') && attrs[attr].toJSON) {
          json[attr] = attrs[attr].toJSON();
        } else {
          json[attr] = (0, _encode2.default)(attrs[attr], false, false, seen);
        }
      }
      var pending = this._getPendingOps();
      for (var attr in pending[0]) {
        json[attr] = pending[0][attr].toJSON();
      }

      if (this.id) {
        json.objectId = this.id;
      }
      return json;
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }
      return other instanceof ParseObject && this.className === other.className && this.id === other.id && typeof this.id !== 'undefined';
    }
  }, {
    key: 'dirty',
    value: function dirty(attr) {
      if (!this.id) {
        return true;
      }
      var pendingOps = this._getPendingOps();
      var dirtyObjects = this._getDirtyObjectAttributes();
      if (attr) {
        if (dirtyObjects.hasOwnProperty(attr)) {
          return true;
        }
        for (var i = 0; i < pendingOps.length; i++) {
          if (pendingOps[i].hasOwnProperty(attr)) {
            return true;
          }
        }
        return false;
      }
      if (Object.keys(pendingOps[0]).length !== 0) {
        return true;
      }
      if (Object.keys(dirtyObjects).length !== 0) {
        return true;
      }
      return false;
    }
  }, {
    key: 'dirtyKeys',
    value: function dirtyKeys() {
      var pendingOps = this._getPendingOps();
      var keys = {};
      for (var i = 0; i < pendingOps.length; i++) {
        for (var attr in pendingOps[i]) {
          keys[attr] = true;
        }
      }
      var dirtyObjects = this._getDirtyObjectAttributes();
      for (var attr in dirtyObjects) {
        keys[attr] = true;
      }
      return Object.keys(keys);
    }
  }, {
    key: 'toPointer',
    value: function toPointer() {
      if (!this.id) {
        throw new Error('Cannot create a pointer to an unsaved ParseObject');
      }
      return {
        __type: 'Pointer',
        className: this.className,
        objectId: this.id
      };
    }
  }, {
    key: 'get',
    value: function get(attr) {
      return this.attributes[attr];
    }
  }, {
    key: 'relation',
    value: function relation(attr) {
      var value = this.get(attr);
      if (value) {
        if (!(value instanceof _ParseRelation2.default)) {
          throw new Error('Called relation() on non-relation field ' + attr);
        }
        value._ensureParentAndKey(this, attr);
        return value;
      }
      return new _ParseRelation2.default(this, attr);
    }
  }, {
    key: 'escape',
    value: function escape(attr) {
      var val = this.attributes[attr];
      if (val == null) {
        return '';
      }

      if (typeof val !== 'string') {
        if (typeof val.toString !== 'function') {
          return '';
        }
        val = val.toString();
      }
      return (0, _escape3.default)(val);
    }
  }, {
    key: 'has',
    value: function has(attr) {
      var attributes = this.attributes;
      if (attributes.hasOwnProperty(attr)) {
        return attributes[attr] != null;
      }
      return false;
    }
  }, {
    key: 'set',
    value: function set(key, value, options) {
      var changes = {};
      var newOps = {};
      if (key && typeof key === 'object') {
        changes = key;
        options = value;
      } else if (typeof key === 'string') {
        changes[key] = value;
      } else {
        return this;
      }

      options = options || {};
      var readonly = [];
      if (typeof this.constructor.readOnlyAttributes === 'function') {
        readonly = readonly.concat(this.constructor.readOnlyAttributes());
      }
      for (var k in changes) {
        if (k === 'createdAt' || k === 'updatedAt') {
          continue;
        }
        if (readonly.indexOf(k) > -1) {
          throw new Error('Cannot modify readonly attribute: ' + k);
        }
        if (options.unset) {
          newOps[k] = new _ParseOp.UnsetOp();
        } else if (changes[k] instanceof _ParseOp.Op) {
          newOps[k] = changes[k];
        } else if (changes[k] && typeof changes[k] === 'object' && typeof changes[k].__op === 'string') {
          newOps[k] = (0, _ParseOp.opFromJSON)(changes[k]);
        } else if (k === 'objectId' || k === 'id') {
          if (typeof changes[k] === 'string') {
            this.id = changes[k];
          }
        } else if (k === 'ACL' && typeof changes[k] === 'object' && !(changes[k] instanceof _ParseACL2.default)) {
          newOps[k] = new _ParseOp.SetOp(new _ParseACL2.default(changes[k]));
        } else {
          newOps[k] = new _ParseOp.SetOp(changes[k]);
        }
      }

      var currentAttributes = this.attributes;
      var newValues = {};
      for (var attr in newOps) {
        if (newOps[attr] instanceof _ParseOp.RelationOp) {
          newValues[attr] = newOps[attr].applyTo(currentAttributes[attr], this, attr);
        } else if (!(newOps[attr] instanceof _ParseOp.UnsetOp)) {
          newValues[attr] = newOps[attr].applyTo(currentAttributes[attr]);
        }
      }

      if (!options.ignoreValidation) {
        var validation = this.validate(newValues);
        if (validation) {
          if (typeof options.error === 'function') {
            options.error(this, validation);
          }
          return false;
        }
      }

      var pendingOps = this._getPendingOps();
      var last = pendingOps.length - 1;
      var stateController = _CoreManager2.default.getObjectStateController();
      for (var attr in newOps) {
        var nextOp = newOps[attr].mergeWith(pendingOps[last][attr]);
        stateController.setPendingOp(this._getStateIdentifier(), attr, nextOp);
      }

      return this;
    }
  }, {
    key: 'unset',
    value: function unset(attr, options) {
      options = options || {};
      options.unset = true;
      return this.set(attr, null, options);
    }
  }, {
    key: 'increment',
    value: function increment(attr, amount) {
      if (typeof amount === 'undefined') {
        amount = 1;
      }
      if (typeof amount !== 'number') {
        throw new Error('Cannot increment by a non-numeric amount.');
      }
      return this.set(attr, new _ParseOp.IncrementOp(amount));
    }
  }, {
    key: 'add',
    value: function add(attr, item) {
      return this.set(attr, new _ParseOp.AddOp([item]));
    }
  }, {
    key: 'addUnique',
    value: function addUnique(attr, item) {
      return this.set(attr, new _ParseOp.AddUniqueOp([item]));
    }
  }, {
    key: 'remove',
    value: function remove(attr, item) {
      return this.set(attr, new _ParseOp.RemoveOp([item]));
    }
  }, {
    key: 'op',
    value: function op(attr) {
      var pending = this._getPendingOps();
      for (var i = pending.length; i--;) {
        if (pending[i][attr]) {
          return pending[i][attr];
        }
      }
    }
  }, {
    key: 'clone',
    value: function clone() {
      var clone = new this.constructor();
      if (!clone.className) {
        clone.className = this.className;
      }
      var attributes = this.attributes;
      if (typeof this.constructor.readOnlyAttributes === 'function') {
        var readonly = this.constructor.readOnlyAttributes() || [];

        var copy = {};
        for (var a in attributes) {
          if (readonly.indexOf(a) < 0) {
            copy[a] = attributes[a];
          }
        }
        attributes = copy;
      }
      if (clone.set) {
        clone.set(attributes);
      }
      return clone;
    }
  }, {
    key: 'newInstance',
    value: function newInstance() {
      var clone = new this.constructor();
      if (!clone.className) {
        clone.className = this.className;
      }
      clone.id = this.id;
      if (singleInstance) {
        return clone;
      }

      var stateController = _CoreManager2.default.getObjectStateController();
      if (stateController) {
        stateController.duplicateState(this._getStateIdentifier(), clone._getStateIdentifier());
      }
      return clone;
    }
  }, {
    key: 'isNew',
    value: function isNew() {
      return !this.id;
    }
  }, {
    key: 'existed',
    value: function existed() {
      if (!this.id) {
        return false;
      }
      var stateController = _CoreManager2.default.getObjectStateController();
      var state = stateController.getState(this._getStateIdentifier());
      if (state) {
        return state.existed;
      }
      return false;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return !this.validate(this.attributes);
    }
  }, {
    key: 'validate',
    value: function validate(attrs) {
      if (attrs.hasOwnProperty('ACL') && !(attrs.ACL instanceof _ParseACL2.default)) {
        return new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'ACL must be a Parse ACL.');
      }
      for (var key in attrs) {
        if (!/^[A-Za-z][0-9A-Za-z_]*$/.test(key)) {
          return new _ParseError2.default(_ParseError2.default.INVALID_KEY_NAME);
        }
      }
      return false;
    }
  }, {
    key: 'getACL',
    value: function getACL() {
      var acl = this.get('ACL');
      if (acl instanceof _ParseACL2.default) {
        return acl;
      }
      return null;
    }
  }, {
    key: 'setACL',
    value: function setACL(acl, options) {
      return this.set('ACL', acl, options);
    }
  }, {
    key: 'revert',
    value: function revert() {
      this._clearPendingOps();
    }
  }, {
    key: 'clear',
    value: function clear() {
      var attributes = this.attributes;
      var erasable = {};
      var readonly = ['createdAt', 'updatedAt'];
      if (typeof this.constructor.readOnlyAttributes === 'function') {
        readonly = readonly.concat(this.constructor.readOnlyAttributes());
      }
      for (var attr in attributes) {
        if (readonly.indexOf(attr) < 0) {
          erasable[attr] = true;
        }
      }
      return this.set(erasable, { unset: true });
    }
  }, {
    key: 'fetch',
    value: function fetch(options) {
      options = options || {};
      var fetchOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        fetchOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        fetchOptions.sessionToken = options.sessionToken;
      }
      var controller = _CoreManager2.default.getObjectController();
      return controller.fetch(this, true, fetchOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'save',
    value: function save(arg1, arg2, arg3) {
      var _this = this;

      var attrs;
      var options;
      if (typeof arg1 === 'object' || typeof arg1 === 'undefined') {
        attrs = arg1;
        if (typeof arg2 === 'object') {
          options = arg2;
        }
      } else {
        attrs = {};
        attrs[arg1] = arg2;
        options = arg3;
      }

      if (!options && attrs) {
        options = {};
        if (typeof attrs.success === 'function') {
          options.success = attrs.success;
          delete attrs.success;
        }
        if (typeof attrs.error === 'function') {
          options.error = attrs.error;
          delete attrs.error;
        }
      }

      if (attrs) {
        var validation = this.validate(attrs);
        if (validation) {
          if (options && typeof options.error === 'function') {
            options.error(this, validation);
          }
          return _ParsePromise2.default.error(validation);
        }
        this.set(attrs, options);
      }

      options = options || {};
      var saveOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        saveOptions.useMasterKey = !!options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken') && typeof options.sessionToken === 'string') {
        saveOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2.default.getObjectController();
      var unsaved = (0, _unsavedChildren2.default)(this);
      return controller.save(unsaved, saveOptions).then(function () {
        return controller.save(_this, saveOptions);
      })._thenRunCallbacks(options, this);
    }
  }, {
    key: 'destroy',
    value: function destroy(options) {
      options = options || {};
      var destroyOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        destroyOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        destroyOptions.sessionToken = options.sessionToken;
      }
      if (!this.id) {
        return _ParsePromise2.default.as()._thenRunCallbacks(options);
      }
      return _CoreManager2.default.getObjectController().destroy(this, destroyOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'attributes',
    get: function get() {
      var stateController = _CoreManager2.default.getObjectStateController();
      return Object.freeze(stateController.estimateAttributes(this._getStateIdentifier()));
    }
  }, {
    key: 'createdAt',
    get: function get() {
      return this._getServerData().createdAt;
    }
  }, {
    key: 'updatedAt',
    get: function get() {
      return this._getServerData().updatedAt;
    }
  }], [{
    key: '_clearAllState',
    value: function _clearAllState() {
      var stateController = _CoreManager2.default.getObjectStateController();
      stateController.clearAllState();
    }
  }, {
    key: 'fetchAll',
    value: function fetchAll(list, options) {
      var options = options || {};

      var queryOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        queryOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        queryOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2.default.getObjectController().fetch(list, true, queryOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'fetchAllIfNeeded',
    value: function fetchAllIfNeeded(list, options) {
      var options = options || {};

      var queryOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        queryOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        queryOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2.default.getObjectController().fetch(list, false, queryOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'destroyAll',
    value: function destroyAll(list, options) {
      var options = options || {};

      var destroyOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        destroyOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        destroyOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2.default.getObjectController().destroy(list, destroyOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'saveAll',
    value: function saveAll(list, options) {
      var options = options || {};

      var saveOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        saveOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        saveOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2.default.getObjectController().save(list, saveOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'createWithoutData',
    value: function createWithoutData(id) {
      var obj = new this();
      obj.id = id;
      return obj;
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(json, override) {
      if (!json.className) {
        throw new Error('Cannot create an object without a className');
      }
      var constructor = classMap[json.className];
      var o = constructor ? new constructor() : new ParseObject(json.className);
      var otherAttributes = {};
      for (var attr in json) {
        if (attr !== 'className' && attr !== '__type') {
          otherAttributes[attr] = json[attr];
        }
      }
      if (override) {
        if (otherAttributes.objectId) {
          o.id = otherAttributes.objectId;
        }
        var preserved = null;
        if (typeof o._preserveFieldsOnFetch === 'function') {
          preserved = o._preserveFieldsOnFetch();
        }
        o._clearServerData();
        if (preserved) {
          o._finishFetch(preserved);
        }
      }
      o._finishFetch(otherAttributes);
      if (json.objectId) {
        o._setExisted(true);
      }
      return o;
    }
  }, {
    key: 'registerSubclass',
    value: function registerSubclass(className, constructor) {
      if (typeof className !== 'string') {
        throw new TypeError('The first argument must be a valid class name.');
      }
      if (typeof constructor === 'undefined') {
        throw new TypeError('You must supply a subclass constructor.');
      }
      if (typeof constructor !== 'function') {
        throw new TypeError('You must register the subclass constructor. ' + 'Did you attempt to register an instance of the subclass?');
      }
      classMap[className] = constructor;
      if (!constructor.className) {
        constructor.className = className;
      }
    }
  }, {
    key: 'extend',
    value: function extend(className, protoProps, classProps) {
      if (typeof className !== 'string') {
        if (className && typeof className.className === 'string') {
          return ParseObject.extend(className.className, className, protoProps);
        } else {
          throw new Error('Parse.Object.extend\'s first argument should be the className.');
        }
      }
      var adjustedClassName = className;

      if (adjustedClassName === 'User' && _CoreManager2.default.get('PERFORM_USER_REWRITE')) {
        adjustedClassName = '_User';
      }

      var parentProto = ParseObject.prototype;
      if (this.hasOwnProperty('__super__') && this.__super__) {
        parentProto = this.prototype;
      } else if (classMap[adjustedClassName]) {
        parentProto = classMap[adjustedClassName].prototype;
      }
      var ParseObjectSubclass = function ParseObjectSubclass(attributes, options) {
        this.className = adjustedClassName;
        this._objCount = objectCount++;

        if (typeof this.initialize === 'function') {
          this.initialize.apply(this, arguments);
        }

        if (attributes && typeof attributes === 'object') {
          if (!this.set(attributes || {}, options)) {
            throw new Error('Can\'t create an invalid Parse Object');
          }
        }
      };
      ParseObjectSubclass.className = adjustedClassName;
      ParseObjectSubclass.__super__ = parentProto;

      ParseObjectSubclass.prototype = Object.create(parentProto, {
        constructor: {
          value: ParseObjectSubclass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });

      if (protoProps) {
        for (var prop in protoProps) {
          if (prop !== 'className') {
            Object.defineProperty(ParseObjectSubclass.prototype, prop, {
              value: protoProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      if (classProps) {
        for (var prop in classProps) {
          if (prop !== 'className') {
            Object.defineProperty(ParseObjectSubclass, prop, {
              value: classProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      ParseObjectSubclass.extend = function (name, protoProps, classProps) {
        if (typeof name === 'string') {
          return ParseObject.extend.call(ParseObjectSubclass, name, protoProps, classProps);
        }
        return ParseObject.extend.call(ParseObjectSubclass, adjustedClassName, name, protoProps);
      };
      ParseObjectSubclass.createWithoutData = ParseObject.createWithoutData;

      classMap[adjustedClassName] = ParseObjectSubclass;
      return ParseObjectSubclass;
    }
  }, {
    key: 'enableSingleInstance',
    value: function enableSingleInstance() {
      singleInstance = true;
      _CoreManager2.default.setObjectStateController(SingleInstanceStateController);
    }
  }, {
    key: 'disableSingleInstance',
    value: function disableSingleInstance() {
      singleInstance = false;
      _CoreManager2.default.setObjectStateController(UniqueInstanceStateController);
    }
  }]);
  return ParseObject;
}();

exports.default = ParseObject;


var DefaultController = {
  fetch: function fetch(target, forceFetch, options) {
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return _ParsePromise2.default.as([]);
      }
      var objs = [];
      var ids = [];
      var className = null;
      var results = [];
      var error = null;
      target.forEach(function (el, i) {
        if (error) {
          return;
        }
        if (!className) {
          className = el.className;
        }
        if (className !== el.className) {
          error = new _ParseError2.default(_ParseError2.default.INVALID_CLASS_NAME, 'All objects should be of the same class');
        }
        if (!el.id) {
          error = new _ParseError2.default(_ParseError2.default.MISSING_OBJECT_ID, 'All objects must have an ID');
        }
        if (forceFetch || Object.keys(el._getServerData()).length === 0) {
          ids.push(el.id);
          objs.push(el);
        }
        results.push(el);
      });
      if (error) {
        return _ParsePromise2.default.error(error);
      }
      var query = new _ParseQuery2.default(className);
      query.containedIn('objectId', ids);
      query._limit = ids.length;
      return query.find(options).then(function (objects) {
        var idMap = {};
        objects.forEach(function (o) {
          idMap[o.id] = o;
        });
        for (var i = 0; i < objs.length; i++) {
          var obj = objs[i];
          if (!obj || !obj.id || !idMap[obj.id]) {
            if (forceFetch) {
              return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.OBJECT_NOT_FOUND, 'All objects must exist on the server.'));
            }
          }
        }
        if (!singleInstance) {
          for (var i = 0; i < results.length; i++) {
            var obj = results[i];
            if (obj && obj.id && idMap[obj.id]) {
              var id = obj.id;
              obj._finishFetch(idMap[id].toJSON());
              results[i] = idMap[id];
            }
          }
        }
        return _ParsePromise2.default.as(results);
      });
    } else {
      var RESTController = _CoreManager2.default.getRESTController();
      return RESTController.request('GET', 'classes/' + target.className + '/' + target._getId(), {}, options).then(function (response, status, xhr) {
        if (target instanceof ParseObject) {
          target._clearPendingOps();
          target._clearServerData();
          target._finishFetch(response);
        }
        return target;
      });
    }
  },
  destroy: function destroy(target, options) {
    var RESTController = _CoreManager2.default.getRESTController();
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return _ParsePromise2.default.as([]);
      }
      var batches = [[]];
      target.forEach(function (obj) {
        if (!obj.id) {
          return;
        }
        batches[batches.length - 1].push(obj);
        if (batches[batches.length - 1].length >= 20) {
          batches.push([]);
        }
      });
      if (batches[batches.length - 1].length === 0) {
        batches.pop();
      }
      var deleteCompleted = _ParsePromise2.default.as();
      var errors = [];
      batches.forEach(function (batch) {
        deleteCompleted = deleteCompleted.then(function () {
          return RESTController.request('POST', 'batch', {
            requests: batch.map(function (obj) {
              return {
                method: 'DELETE',
                path: getServerUrlPath() + 'classes/' + obj.className + '/' + obj._getId(),
                body: {}
              };
            })
          }, options).then(function (results) {
            for (var i = 0; i < results.length; i++) {
              if (results[i] && results[i].hasOwnProperty('error')) {
                var err = new _ParseError2.default(results[i].error.code, results[i].error.error);
                err.object = batch[i];
                errors.push(err);
              }
            }
          });
        });
      });
      return deleteCompleted.then(function () {
        if (errors.length) {
          var aggregate = new _ParseError2.default(_ParseError2.default.AGGREGATE_ERROR);
          aggregate.errors = errors;
          return _ParsePromise2.default.error(aggregate);
        }
        return _ParsePromise2.default.as(target);
      });
    } else if (target instanceof ParseObject) {
      return RESTController.request('DELETE', 'classes/' + target.className + '/' + target._getId(), {}, options).then(function () {
        return _ParsePromise2.default.as(target);
      });
    }
    return _ParsePromise2.default.as(target);
  },
  save: function save(target, options) {
    var RESTController = _CoreManager2.default.getRESTController();
    var stateController = _CoreManager2.default.getObjectStateController();
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return _ParsePromise2.default.as([]);
      }

      var unsaved = target.concat();
      for (var i = 0; i < target.length; i++) {
        if (target[i] instanceof ParseObject) {
          unsaved = unsaved.concat((0, _unsavedChildren2.default)(target[i], true));
        }
      }
      unsaved = (0, _unique2.default)(unsaved);

      var filesSaved = _ParsePromise2.default.as();
      var pending = [];
      unsaved.forEach(function (el) {
        if (el instanceof _ParseFile2.default) {
          filesSaved = filesSaved.then(function () {
            return el.save();
          });
        } else if (el instanceof ParseObject) {
          pending.push(el);
        }
      });

      return filesSaved.then(function () {
        var objectError = null;
        return _ParsePromise2.default._continueWhile(function () {
          return pending.length > 0;
        }, function () {
          var batch = [];
          var nextPending = [];
          pending.forEach(function (el) {
            if (batch.length < 20 && (0, _canBeSerialized2.default)(el)) {
              batch.push(el);
            } else {
              nextPending.push(el);
            }
          });
          pending = nextPending;
          if (batch.length < 1) {
            return _ParsePromise2.default.error(new _ParseError2.default(_ParseError2.default.OTHER_CAUSE, 'Tried to save a batch with a cycle.'));
          }

          var batchReturned = new _ParsePromise2.default();
          var batchReady = [];
          var batchTasks = [];
          batch.forEach(function (obj, index) {
            var ready = new _ParsePromise2.default();
            batchReady.push(ready);

            stateController.pushPendingState(obj._getStateIdentifier());
            batchTasks.push(stateController.enqueueTask(obj._getStateIdentifier(), function () {
              ready.resolve();
              return batchReturned.then(function (responses, status) {
                if (responses[index].hasOwnProperty('success')) {
                  obj._handleSaveResponse(responses[index].success, status);
                } else {
                  if (!objectError && responses[index].hasOwnProperty('error')) {
                    var serverError = responses[index].error;
                    objectError = new _ParseError2.default(serverError.code, serverError.error);

                    pending = [];
                  }
                  obj._handleSaveError();
                }
              });
            }));
          });

          _ParsePromise2.default.when(batchReady).then(function () {
            return RESTController.request('POST', 'batch', {
              requests: batch.map(function (obj) {
                var params = obj._getSaveParams();
                params.path = getServerUrlPath() + params.path;
                return params;
              })
            }, options);
          }).then(function (response, status, xhr) {
            batchReturned.resolve(response, status);
          });

          return _ParsePromise2.default.when(batchTasks);
        }).then(function () {
          if (objectError) {
            return _ParsePromise2.default.error(objectError);
          }
          return _ParsePromise2.default.as(target);
        });
      });
    } else if (target instanceof ParseObject) {
      var targetCopy = target;
      var task = function task() {
        var params = targetCopy._getSaveParams();
        return RESTController.request(params.method, params.path, params.body, options).then(function (response, status) {
          targetCopy._handleSaveResponse(response, status);
        }, function (error) {
          targetCopy._handleSaveError();
          return _ParsePromise2.default.error(error);
        });
      };

      stateController.pushPendingState(target._getStateIdentifier());
      return stateController.enqueueTask(target._getStateIdentifier(), task).then(function () {
        return target;
      }, function (error) {
        return _ParsePromise2.default.error(error);
      });
    }
    return _ParsePromise2.default.as();
  }
};

_CoreManager2.default.setObjectController(DefaultController);