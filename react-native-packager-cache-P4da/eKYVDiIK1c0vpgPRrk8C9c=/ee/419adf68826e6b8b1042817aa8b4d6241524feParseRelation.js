Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ParseOp = require('./ParseOp');

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = babelHelpers.interopRequireDefault(_ParseQuery);

var ParseRelation = function () {
  function ParseRelation(parent, key) {
    babelHelpers.classCallCheck(this, ParseRelation);

    this.parent = parent;
    this.key = key;
    this.targetClassName = null;
  }

  babelHelpers.createClass(ParseRelation, [{
    key: '_ensureParentAndKey',
    value: function _ensureParentAndKey(parent, key) {
      this.key = this.key || key;
      if (this.key !== key) {
        throw new Error('Internal Error. Relation retrieved from two different keys.');
      }
      if (this.parent) {
        if (this.parent.className !== parent.className) {
          throw new Error('Internal Error. Relation retrieved from two different Objects.');
        }
        if (this.parent.id) {
          if (this.parent.id !== parent.id) {
            throw new Error('Internal Error. Relation retrieved from two different Objects.');
          }
        } else if (parent.id) {
          this.parent = parent;
        }
      } else {
        this.parent = parent;
      }
    }
  }, {
    key: 'add',
    value: function add(objects) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      var change = new _ParseOp.RelationOp(objects, []);
      var parent = this.parent;
      if (!parent) {
        throw new Error('Cannot add to a Relation without a parent');
      }
      parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
      return parent;
    }
  }, {
    key: 'remove',
    value: function remove(objects) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      var change = new _ParseOp.RelationOp([], objects);
      if (!this.parent) {
        throw new Error('Cannot remove from a Relation without a parent');
      }
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        __type: 'Relation',
        className: this.targetClassName
      };
    }
  }, {
    key: 'query',
    value: function query() {
      var query;
      var parent = this.parent;
      if (!parent) {
        throw new Error('Cannot construct a query for a Relation without a parent');
      }
      if (!this.targetClassName) {
        query = new _ParseQuery2.default(parent.className);
        query._extraOptions.redirectClassNameForKey = this.key;
      } else {
        query = new _ParseQuery2.default(this.targetClassName);
      }
      query._addCondition('$relatedTo', 'object', {
        __type: 'Pointer',
        className: parent.className,
        objectId: parent.id
      });
      query._addCondition('$relatedTo', 'key', this.key);

      return query;
    }
  }]);
  return ParseRelation;
}();

exports.default = ParseRelation;