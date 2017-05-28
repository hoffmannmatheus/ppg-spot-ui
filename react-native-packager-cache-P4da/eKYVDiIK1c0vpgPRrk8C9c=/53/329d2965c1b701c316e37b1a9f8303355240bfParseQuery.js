Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _ParseError = require('./ParseError');

var _ParseError2 = babelHelpers.interopRequireDefault(_ParseError);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = babelHelpers.interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

function quote(s) {
  return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
}

var ParseQuery = function () {
  function ParseQuery(objectClass) {
    babelHelpers.classCallCheck(this, ParseQuery);

    if (typeof objectClass === 'string') {
      if (objectClass === 'User' && _CoreManager2.default.get('PERFORM_USER_REWRITE')) {
        this.className = '_User';
      } else {
        this.className = objectClass;
      }
    } else if (objectClass instanceof _ParseObject2.default) {
      this.className = objectClass.className;
    } else if (typeof objectClass === 'function') {
      if (typeof objectClass.className === 'string') {
        this.className = objectClass.className;
      } else {
        var obj = new objectClass();
        this.className = obj.className;
      }
    } else {
      throw new TypeError('A ParseQuery must be constructed with a ParseObject or class name.');
    }

    this._where = {};
    this._include = [];
    this._limit = -1;
    this._skip = 0;
    this._extraOptions = {};
  }

  babelHelpers.createClass(ParseQuery, [{
    key: '_orQuery',
    value: function _orQuery(queries) {
      var queryJSON = queries.map(function (q) {
        return q.toJSON().where;
      });

      this._where.$or = queryJSON;
      return this;
    }
  }, {
    key: '_addCondition',
    value: function _addCondition(key, condition, value) {
      if (!this._where[key] || typeof this._where[key] === 'string') {
        this._where[key] = {};
      }
      this._where[key][condition] = (0, _encode2.default)(value, false, true);
      return this;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var params = {
        where: this._where
      };

      if (this._include.length) {
        params.include = this._include.join(',');
      }
      if (this._select) {
        params.keys = this._select.join(',');
      }
      if (this._limit >= 0) {
        params.limit = this._limit;
      }
      if (this._skip > 0) {
        params.skip = this._skip;
      }
      if (this._order) {
        params.order = this._order.join(',');
      }
      for (var key in this._extraOptions) {
        params[key] = this._extraOptions[key];
      }

      return params;
    }
  }, {
    key: 'get',
    value: function get(objectId, options) {
      this.equalTo('objectId', objectId);

      var firstOptions = {};
      if (options && options.hasOwnProperty('useMasterKey')) {
        firstOptions.useMasterKey = options.useMasterKey;
      }
      if (options && options.hasOwnProperty('sessionToken')) {
        firstOptions.sessionToken = options.sessionToken;
      }

      return this.first(firstOptions).then(function (response) {
        if (response) {
          return response;
        }

        var errorObject = new _ParseError2.default(_ParseError2.default.OBJECT_NOT_FOUND, 'Object not found.');
        return _ParsePromise2.default.error(errorObject);
      })._thenRunCallbacks(options, null);
    }
  }, {
    key: 'find',
    value: function find(options) {
      var _this = this;

      options = options || {};

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2.default.getQueryController();

      return controller.find(this.className, this.toJSON(), findOptions).then(function (response) {
        return response.results.map(function (data) {
          var override = response.className || _this.className;
          if (!data.className) {
            data.className = override;
          }
          return _ParseObject2.default.fromJSON(data, true);
        });
      })._thenRunCallbacks(options);
    }
  }, {
    key: 'count',
    value: function count(options) {
      options = options || {};

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2.default.getQueryController();

      var params = this.toJSON();
      params.limit = 0;
      params.count = 1;

      return controller.find(this.className, params, findOptions).then(function (result) {
        return result.count;
      })._thenRunCallbacks(options);
    }
  }, {
    key: 'first',
    value: function first(options) {
      var _this2 = this;

      options = options || {};

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2.default.getQueryController();

      var params = this.toJSON();
      params.limit = 1;

      return controller.find(this.className, params, findOptions).then(function (response) {
        var objects = response.results;
        if (!objects[0]) {
          return undefined;
        }
        if (!objects[0].className) {
          objects[0].className = _this2.className;
        }
        return _ParseObject2.default.fromJSON(objects[0], true);
      })._thenRunCallbacks(options);
    }
  }, {
    key: 'each',
    value: function each(callback, options) {
      options = options || {};

      if (this._order || this._skip || this._limit >= 0) {
        return _ParsePromise2.default.error('Cannot iterate on a query with sort, skip, or limit.')._thenRunCallbacks(options);
      }

      new _ParsePromise2.default();

      var query = new ParseQuery(this.className);

      query._limit = options.batchSize || 100;
      query._include = this._include.map(function (i) {
        return i;
      });
      if (this._select) {
        query._select = this._select.map(function (s) {
          return s;
        });
      }

      query._where = {};
      for (var attr in this._where) {
        var val = this._where[attr];
        if (Array.isArray(val)) {
          query._where[attr] = val.map(function (v) {
            return v;
          });
        } else if (val && typeof val === 'object') {
          var conditionMap = {};
          query._where[attr] = conditionMap;
          for (var cond in val) {
            conditionMap[cond] = val[cond];
          }
        } else {
          query._where[attr] = val;
        }
      }

      query.ascending('objectId');

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var finished = false;
      return _ParsePromise2.default._continueWhile(function () {
        return !finished;
      }, function () {
        return query.find(findOptions).then(function (results) {
          var callbacksDone = _ParsePromise2.default.as();
          results.forEach(function (result) {
            callbacksDone = callbacksDone.then(function () {
              return callback(result);
            });
          });

          return callbacksDone.then(function () {
            if (results.length >= query._limit) {
              query.greaterThan('objectId', results[results.length - 1].id);
            } else {
              finished = true;
            }
          });
        });
      })._thenRunCallbacks(options);
    }
  }, {
    key: 'equalTo',
    value: function equalTo(key, value) {
      if (typeof value === 'undefined') {
        return this.doesNotExist(key);
      }

      this._where[key] = (0, _encode2.default)(value, false, true);
      return this;
    }
  }, {
    key: 'notEqualTo',
    value: function notEqualTo(key, value) {
      return this._addCondition(key, '$ne', value);
    }
  }, {
    key: 'lessThan',
    value: function lessThan(key, value) {
      return this._addCondition(key, '$lt', value);
    }
  }, {
    key: 'greaterThan',
    value: function greaterThan(key, value) {
      return this._addCondition(key, '$gt', value);
    }
  }, {
    key: 'lessThanOrEqualTo',
    value: function lessThanOrEqualTo(key, value) {
      return this._addCondition(key, '$lte', value);
    }
  }, {
    key: 'greaterThanOrEqualTo',
    value: function greaterThanOrEqualTo(key, value) {
      return this._addCondition(key, '$gte', value);
    }
  }, {
    key: 'containedIn',
    value: function containedIn(key, value) {
      return this._addCondition(key, '$in', value);
    }
  }, {
    key: 'notContainedIn',
    value: function notContainedIn(key, value) {
      return this._addCondition(key, '$nin', value);
    }
  }, {
    key: 'containsAll',
    value: function containsAll(key, values) {
      return this._addCondition(key, '$all', values);
    }
  }, {
    key: 'exists',
    value: function exists(key) {
      return this._addCondition(key, '$exists', true);
    }
  }, {
    key: 'doesNotExist',
    value: function doesNotExist(key) {
      return this._addCondition(key, '$exists', false);
    }
  }, {
    key: 'matches',
    value: function matches(key, regex, modifiers) {
      this._addCondition(key, '$regex', regex);
      if (!modifiers) {
        modifiers = '';
      }
      if (regex.ignoreCase) {
        modifiers += 'i';
      }
      if (regex.multiline) {
        modifiers += 'm';
      }
      if (modifiers.length) {
        this._addCondition(key, '$options', modifiers);
      }
      return this;
    }
  }, {
    key: 'matchesQuery',
    value: function matchesQuery(key, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$inQuery', queryJSON);
    }
  }, {
    key: 'doesNotMatchQuery',
    value: function doesNotMatchQuery(key, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$notInQuery', queryJSON);
    }
  }, {
    key: 'matchesKeyInQuery',
    value: function matchesKeyInQuery(key, queryKey, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$select', {
        key: queryKey,
        query: queryJSON
      });
    }
  }, {
    key: 'doesNotMatchKeyInQuery',
    value: function doesNotMatchKeyInQuery(key, queryKey, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$dontSelect', {
        key: queryKey,
        query: queryJSON
      });
    }
  }, {
    key: 'contains',
    value: function contains(key, value) {
      if (typeof value !== 'string') {
        throw new Error('The value being searched for must be a string.');
      }
      return this._addCondition(key, '$regex', quote(value));
    }
  }, {
    key: 'startsWith',
    value: function startsWith(key, value) {
      if (typeof value !== 'string') {
        throw new Error('The value being searched for must be a string.');
      }
      return this._addCondition(key, '$regex', '^' + quote(value));
    }
  }, {
    key: 'endsWith',
    value: function endsWith(key, value) {
      if (typeof value !== 'string') {
        throw new Error('The value being searched for must be a string.');
      }
      return this._addCondition(key, '$regex', quote(value) + '$');
    }
  }, {
    key: 'near',
    value: function near(key, point) {
      if (!(point instanceof _ParseGeoPoint2.default)) {
        point = new _ParseGeoPoint2.default(point);
      }
      return this._addCondition(key, '$nearSphere', point);
    }
  }, {
    key: 'withinRadians',
    value: function withinRadians(key, point, distance) {
      this.near(key, point);
      return this._addCondition(key, '$maxDistance', distance);
    }
  }, {
    key: 'withinMiles',
    value: function withinMiles(key, point, distance) {
      return this.withinRadians(key, point, distance / 3958.8);
    }
  }, {
    key: 'withinKilometers',
    value: function withinKilometers(key, point, distance) {
      return this.withinRadians(key, point, distance / 6371.0);
    }
  }, {
    key: 'withinGeoBox',
    value: function withinGeoBox(key, southwest, northeast) {
      if (!(southwest instanceof _ParseGeoPoint2.default)) {
        southwest = new _ParseGeoPoint2.default(southwest);
      }
      if (!(northeast instanceof _ParseGeoPoint2.default)) {
        northeast = new _ParseGeoPoint2.default(northeast);
      }
      this._addCondition(key, '$within', { '$box': [southwest, northeast] });
      return this;
    }
  }, {
    key: 'ascending',
    value: function ascending() {
      this._order = [];

      for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
      }

      return this.addAscending.apply(this, keys);
    }
  }, {
    key: 'addAscending',
    value: function addAscending() {
      var _this3 = this;

      if (!this._order) {
        this._order = [];
      }

      for (var _len2 = arguments.length, keys = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        keys[_key2] = arguments[_key2];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          key = key.join();
        }
        _this3._order = _this3._order.concat(key.replace(/\s/g, '').split(','));
      });

      return this;
    }
  }, {
    key: 'descending',
    value: function descending() {
      this._order = [];

      for (var _len3 = arguments.length, keys = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        keys[_key3] = arguments[_key3];
      }

      return this.addDescending.apply(this, keys);
    }
  }, {
    key: 'addDescending',
    value: function addDescending() {
      var _this4 = this;

      if (!this._order) {
        this._order = [];
      }

      for (var _len4 = arguments.length, keys = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        keys[_key4] = arguments[_key4];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          key = key.join();
        }
        _this4._order = _this4._order.concat(key.replace(/\s/g, '').split(',').map(function (k) {
          return '-' + k;
        }));
      });

      return this;
    }
  }, {
    key: 'skip',
    value: function skip(n) {
      if (typeof n !== 'number' || n < 0) {
        throw new Error('You can only skip by a positive number');
      }
      this._skip = n;
      return this;
    }
  }, {
    key: 'limit',
    value: function limit(n) {
      if (typeof n !== 'number') {
        throw new Error('You can only set the limit to a numeric value');
      }
      this._limit = n;
      return this;
    }
  }, {
    key: 'include',
    value: function include() {
      var _this5 = this;

      for (var _len5 = arguments.length, keys = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        keys[_key5] = arguments[_key5];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          _this5._include = _this5._include.concat(key);
        } else {
          _this5._include.push(key);
        }
      });
      return this;
    }
  }, {
    key: 'select',
    value: function select() {
      var _this6 = this;

      if (!this._select) {
        this._select = [];
      }

      for (var _len6 = arguments.length, keys = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        keys[_key6] = arguments[_key6];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          _this6._select = _this6._select.concat(key);
        } else {
          _this6._select.push(key);
        }
      });
      return this;
    }
  }, {
    key: 'subscribe',
    value: function subscribe() {
      var controller = _CoreManager2.default.getLiveQueryController();
      return controller.subscribe(this);
    }
  }], [{
    key: 'or',
    value: function or() {
      var className = null;

      for (var _len7 = arguments.length, queries = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        queries[_key7] = arguments[_key7];
      }

      queries.forEach(function (q) {
        if (!className) {
          className = q.className;
        }

        if (className !== q.className) {
          throw new Error('All queries must be for the same class.');
        }
      });

      var query = new ParseQuery(className);
      query._orQuery(queries);
      return query;
    }
  }]);
  return ParseQuery;
}();

exports.default = ParseQuery;


var DefaultController = {
  find: function find(className, params, options) {
    var RESTController = _CoreManager2.default.getRESTController();

    return RESTController.request('GET', 'classes/' + className, params, options);
  }
};

_CoreManager2.default.setQueryController(DefaultController);