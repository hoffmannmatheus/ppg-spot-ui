Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelationOp = exports.RemoveOp = exports.AddUniqueOp = exports.AddOp = exports.IncrementOp = exports.UnsetOp = exports.SetOp = exports.Op = undefined;
exports.opFromJSON = opFromJSON;

var _arrayContainsObject = require('./arrayContainsObject');

var _arrayContainsObject2 = babelHelpers.interopRequireDefault(_arrayContainsObject);

var _decode = require('./decode');

var _decode2 = babelHelpers.interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = babelHelpers.interopRequireDefault(_ParseRelation);

var _unique = require('./unique');

var _unique2 = babelHelpers.interopRequireDefault(_unique);

function opFromJSON(json) {
  if (!json || !json.__op) {
    return null;
  }
  switch (json.__op) {
    case 'Delete':
      return new UnsetOp();
    case 'Increment':
      return new IncrementOp(json.amount);
    case 'Add':
      return new AddOp((0, _decode2.default)(json.objects));
    case 'AddUnique':
      return new AddUniqueOp((0, _decode2.default)(json.objects));
    case 'Remove':
      return new RemoveOp((0, _decode2.default)(json.objects));
    case 'AddRelation':
      var toAdd = (0, _decode2.default)(json.objects);
      if (!Array.isArray(toAdd)) {
        return new RelationOp([], []);
      }
      return new RelationOp(toAdd, []);
    case 'RemoveRelation':
      var toRemove = (0, _decode2.default)(json.objects);
      if (!Array.isArray(toRemove)) {
        return new RelationOp([], []);
      }
      return new RelationOp([], toRemove);
    case 'Batch':
      var toAdd = [];
      var toRemove = [];
      for (var i = 0; i < json.ops.length; i++) {
        if (json.ops[i].__op === 'AddRelation') {
          toAdd = toAdd.concat((0, _decode2.default)(json.ops[i].objects));
        } else if (json.ops[i].__op === 'RemoveRelation') {
          toRemove = toRemove.concat((0, _decode2.default)(json.ops[i].objects));
        }
      }
      return new RelationOp(toAdd, toRemove);
  }
  return null;
}

var Op = exports.Op = function () {
  function Op() {
    babelHelpers.classCallCheck(this, Op);
  }

  babelHelpers.createClass(Op, [{
    key: 'applyTo',
    value: function applyTo(value) {}
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {}
  }, {
    key: 'toJSON',
    value: function toJSON() {}
  }]);
  return Op;
}();

var SetOp = exports.SetOp = function (_Op) {
  babelHelpers.inherits(SetOp, _Op);

  function SetOp(value) {
    babelHelpers.classCallCheck(this, SetOp);

    var _this = babelHelpers.possibleConstructorReturn(this, (SetOp.__proto__ || Object.getPrototypeOf(SetOp)).call(this));

    _this._value = value;
    return _this;
  }

  babelHelpers.createClass(SetOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      return this._value;
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      return new SetOp(this._value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return (0, _encode2.default)(this._value, false, true);
    }
  }]);
  return SetOp;
}(Op);

var UnsetOp = exports.UnsetOp = function (_Op2) {
  babelHelpers.inherits(UnsetOp, _Op2);

  function UnsetOp() {
    babelHelpers.classCallCheck(this, UnsetOp);
    return babelHelpers.possibleConstructorReturn(this, (UnsetOp.__proto__ || Object.getPrototypeOf(UnsetOp)).apply(this, arguments));
  }

  babelHelpers.createClass(UnsetOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      return undefined;
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      return new UnsetOp();
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Delete' };
    }
  }]);
  return UnsetOp;
}(Op);

var IncrementOp = exports.IncrementOp = function (_Op3) {
  babelHelpers.inherits(IncrementOp, _Op3);

  function IncrementOp(amount) {
    babelHelpers.classCallCheck(this, IncrementOp);

    var _this3 = babelHelpers.possibleConstructorReturn(this, (IncrementOp.__proto__ || Object.getPrototypeOf(IncrementOp)).call(this));

    if (typeof amount !== 'number') {
      throw new TypeError('Increment Op must be initialized with a numeric amount.');
    }
    _this3._amount = amount;
    return _this3;
  }

  babelHelpers.createClass(IncrementOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (typeof value === 'undefined') {
        return this._amount;
      }
      if (typeof value !== 'number') {
        throw new TypeError('Cannot increment a non-numeric value.');
      }
      return this._amount + value;
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new SetOp(this._amount);
      }
      if (previous instanceof IncrementOp) {
        return new IncrementOp(this.applyTo(previous._amount));
      }
      throw new Error('Cannot merge Increment Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Increment', amount: this._amount };
    }
  }]);
  return IncrementOp;
}(Op);

var AddOp = exports.AddOp = function (_Op4) {
  babelHelpers.inherits(AddOp, _Op4);

  function AddOp(value) {
    babelHelpers.classCallCheck(this, AddOp);

    var _this4 = babelHelpers.possibleConstructorReturn(this, (AddOp.__proto__ || Object.getPrototypeOf(AddOp)).call(this));

    _this4._value = Array.isArray(value) ? value : [value];
    return _this4;
  }

  babelHelpers.createClass(AddOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (value == null) {
        return this._value;
      }
      if (Array.isArray(value)) {
        return value.concat(this._value);
      }
      throw new Error('Cannot add elements to a non-array value');
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new SetOp(this._value);
      }
      if (previous instanceof AddOp) {
        return new AddOp(this.applyTo(previous._value));
      }
      throw new Error('Cannot merge Add Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Add', objects: (0, _encode2.default)(this._value, false, true) };
    }
  }]);
  return AddOp;
}(Op);

var AddUniqueOp = exports.AddUniqueOp = function (_Op5) {
  babelHelpers.inherits(AddUniqueOp, _Op5);

  function AddUniqueOp(value) {
    babelHelpers.classCallCheck(this, AddUniqueOp);

    var _this5 = babelHelpers.possibleConstructorReturn(this, (AddUniqueOp.__proto__ || Object.getPrototypeOf(AddUniqueOp)).call(this));

    _this5._value = (0, _unique2.default)(Array.isArray(value) ? value : [value]);
    return _this5;
  }

  babelHelpers.createClass(AddUniqueOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (value == null) {
        return this._value || [];
      }
      if (Array.isArray(value)) {
        var valueCopy = value;
        var toAdd = [];
        this._value.forEach(function (v) {
          if (v instanceof _ParseObject2.default) {
            if (!(0, _arrayContainsObject2.default)(valueCopy, v)) {
              toAdd.push(v);
            }
          } else {
            if (valueCopy.indexOf(v) < 0) {
              toAdd.push(v);
            }
          }
        });
        return value.concat(toAdd);
      }
      throw new Error('Cannot add elements to a non-array value');
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new SetOp(this._value);
      }
      if (previous instanceof AddUniqueOp) {
        return new AddUniqueOp(this.applyTo(previous._value));
      }
      throw new Error('Cannot merge AddUnique Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'AddUnique', objects: (0, _encode2.default)(this._value, false, true) };
    }
  }]);
  return AddUniqueOp;
}(Op);

var RemoveOp = exports.RemoveOp = function (_Op6) {
  babelHelpers.inherits(RemoveOp, _Op6);

  function RemoveOp(value) {
    babelHelpers.classCallCheck(this, RemoveOp);

    var _this6 = babelHelpers.possibleConstructorReturn(this, (RemoveOp.__proto__ || Object.getPrototypeOf(RemoveOp)).call(this));

    _this6._value = (0, _unique2.default)(Array.isArray(value) ? value : [value]);
    return _this6;
  }

  babelHelpers.createClass(RemoveOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (value == null) {
        return [];
      }
      if (Array.isArray(value)) {
        var i = value.indexOf(this._value);
        var removed = value.concat([]);
        for (var i = 0; i < this._value.length; i++) {
          var index = removed.indexOf(this._value[i]);
          while (index > -1) {
            removed.splice(index, 1);
            index = removed.indexOf(this._value[i]);
          }
          if (this._value[i] instanceof _ParseObject2.default && this._value[i].id) {
            for (var j = 0; j < removed.length; j++) {
              if (removed[j] instanceof _ParseObject2.default && this._value[i].id === removed[j].id) {
                removed.splice(j, 1);
                j--;
              }
            }
          }
        }
        return removed;
      }
      throw new Error('Cannot remove elements from a non-array value');
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new UnsetOp();
      }
      if (previous instanceof RemoveOp) {
        var uniques = previous._value.concat([]);
        for (var i = 0; i < this._value.length; i++) {
          if (this._value[i] instanceof _ParseObject2.default) {
            if (!(0, _arrayContainsObject2.default)(uniques, this._value[i])) {
              uniques.push(this._value[i]);
            }
          } else {
            if (uniques.indexOf(this._value[i]) < 0) {
              uniques.push(this._value[i]);
            }
          }
        }
        return new RemoveOp(uniques);
      }
      throw new Error('Cannot merge Remove Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Remove', objects: (0, _encode2.default)(this._value, false, true) };
    }
  }]);
  return RemoveOp;
}(Op);

var RelationOp = exports.RelationOp = function (_Op7) {
  babelHelpers.inherits(RelationOp, _Op7);

  function RelationOp(adds, removes) {
    babelHelpers.classCallCheck(this, RelationOp);

    var _this7 = babelHelpers.possibleConstructorReturn(this, (RelationOp.__proto__ || Object.getPrototypeOf(RelationOp)).call(this));

    _this7._targetClassName = null;

    if (Array.isArray(adds)) {
      _this7.relationsToAdd = (0, _unique2.default)(adds.map(_this7._extractId, _this7));
    }

    if (Array.isArray(removes)) {
      _this7.relationsToRemove = (0, _unique2.default)(removes.map(_this7._extractId, _this7));
    }
    return _this7;
  }

  babelHelpers.createClass(RelationOp, [{
    key: '_extractId',
    value: function _extractId(obj) {
      if (typeof obj === 'string') {
        return obj;
      }
      if (!obj.id) {
        throw new Error('You cannot add or remove an unsaved Parse Object from a relation');
      }
      if (!this._targetClassName) {
        this._targetClassName = obj.className;
      }
      if (this._targetClassName !== obj.className) {
        throw new Error('Tried to create a Relation with 2 different object types: ' + this._targetClassName + ' and ' + obj.className + '.');
      }
      return obj.id;
    }
  }, {
    key: 'applyTo',
    value: function applyTo(value, object, key) {
      if (!value) {
        if (!object || !key) {
          throw new Error('Cannot apply a RelationOp without either a previous value, or an object and a key');
        }
        var parent = new _ParseObject2.default(object.className);
        if (object.id && object.id.indexOf('local') === 0) {
          parent._localId = object.id;
        } else if (object.id) {
          parent.id = object.id;
        }
        var relation = new _ParseRelation2.default(parent, key);
        relation.targetClassName = this._targetClassName;
        return relation;
      }
      if (value instanceof _ParseRelation2.default) {
        if (this._targetClassName) {
          if (value.targetClassName) {
            if (this._targetClassName !== value.targetClassName) {
              throw new Error('Related object must be a ' + value.targetClassName + ', but a ' + this._targetClassName + ' was passed in.');
            }
          } else {
            value.targetClassName = this._targetClassName;
          }
        }
        return value;
      } else {
        throw new Error('Relation cannot be applied to a non-relation field');
      }
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof UnsetOp) {
        throw new Error('You cannot modify a relation after deleting it.');
      } else if (previous instanceof RelationOp) {
        if (previous._targetClassName && previous._targetClassName !== this._targetClassName) {
          throw new Error('Related object must be of class ' + previous._targetClassName + ', but ' + (this._targetClassName || 'null') + ' was passed in.');
        }
        var newAdd = previous.relationsToAdd.concat([]);
        this.relationsToRemove.forEach(function (r) {
          var index = newAdd.indexOf(r);
          if (index > -1) {
            newAdd.splice(index, 1);
          }
        });
        this.relationsToAdd.forEach(function (r) {
          var index = newAdd.indexOf(r);
          if (index < 0) {
            newAdd.push(r);
          }
        });

        var newRemove = previous.relationsToRemove.concat([]);
        this.relationsToAdd.forEach(function (r) {
          var index = newRemove.indexOf(r);
          if (index > -1) {
            newRemove.splice(index, 1);
          }
        });
        this.relationsToRemove.forEach(function (r) {
          var index = newRemove.indexOf(r);
          if (index < 0) {
            newRemove.push(r);
          }
        });

        var newRelation = new RelationOp(newAdd, newRemove);
        newRelation._targetClassName = this._targetClassName;
        return newRelation;
      }
      throw new Error('Cannot merge Relation Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this8 = this;

      var idToPointer = function idToPointer(id) {
        return {
          __type: 'Pointer',
          className: _this8._targetClassName,
          objectId: id
        };
      };

      var adds = null;
      var removes = null;
      var pointers = null;

      if (this.relationsToAdd.length > 0) {
        pointers = this.relationsToAdd.map(idToPointer);
        adds = { __op: 'AddRelation', objects: pointers };
      }
      if (this.relationsToRemove.length > 0) {
        pointers = this.relationsToRemove.map(idToPointer);
        removes = { __op: 'RemoveRelation', objects: pointers };
      }

      if (adds && removes) {
        return { __op: 'Batch', ops: [adds, removes] };
      }

      return adds || removes || {};
    }
  }]);
  return RelationOp;
}(Op);