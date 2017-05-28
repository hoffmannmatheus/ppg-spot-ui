Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultState = defaultState;
exports.setServerData = setServerData;
exports.setPendingOp = setPendingOp;
exports.pushPendingState = pushPendingState;
exports.popPendingState = popPendingState;
exports.mergeFirstPendingState = mergeFirstPendingState;
exports.estimateAttribute = estimateAttribute;
exports.estimateAttributes = estimateAttributes;
exports.commitServerChanges = commitServerChanges;

var _encode = require('./encode');

var _encode2 = babelHelpers.interopRequireDefault(_encode);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = babelHelpers.interopRequireDefault(_ParseFile);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = babelHelpers.interopRequireDefault(_ParseObject);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = babelHelpers.interopRequireDefault(_ParseRelation);

var _TaskQueue = require('./TaskQueue');

var _TaskQueue2 = babelHelpers.interopRequireDefault(_TaskQueue);

var _ParseOp = require('./ParseOp');

function defaultState() {
  return {
    serverData: {},
    pendingOps: [{}],
    objectCache: {},
    tasks: new _TaskQueue2.default(),
    existed: false
  };
}

function setServerData(serverData, attributes) {
  for (var attr in attributes) {
    if (typeof attributes[attr] !== 'undefined') {
      serverData[attr] = attributes[attr];
    } else {
      delete serverData[attr];
    }
  }
}

function setPendingOp(pendingOps, attr, op) {
  var last = pendingOps.length - 1;
  if (op) {
    pendingOps[last][attr] = op;
  } else {
    delete pendingOps[last][attr];
  }
}

function pushPendingState(pendingOps) {
  pendingOps.push({});
}

function popPendingState(pendingOps) {
  var first = pendingOps.shift();
  if (!pendingOps.length) {
    pendingOps[0] = {};
  }
  return first;
}

function mergeFirstPendingState(pendingOps) {
  var first = popPendingState(pendingOps);
  var next = pendingOps[0];
  for (var attr in first) {
    if (next[attr] && first[attr]) {
      var merged = next[attr].mergeWith(first[attr]);
      if (merged) {
        next[attr] = merged;
      }
    } else {
      next[attr] = first[attr];
    }
  }
}

function estimateAttribute(serverData, pendingOps, className, id, attr) {
  var value = serverData[attr];
  for (var i = 0; i < pendingOps.length; i++) {
    if (pendingOps[i][attr]) {
      if (pendingOps[i][attr] instanceof _ParseOp.RelationOp) {
        if (id) {
          value = pendingOps[i][attr].applyTo(value, { className: className, id: id }, attr);
        }
      } else {
        value = pendingOps[i][attr].applyTo(value);
      }
    }
  }
  return value;
}

function estimateAttributes(serverData, pendingOps, className, id) {
  var data = {};

  for (var attr in serverData) {
    data[attr] = serverData[attr];
  }
  for (var i = 0; i < pendingOps.length; i++) {
    for (attr in pendingOps[i]) {
      if (pendingOps[i][attr] instanceof _ParseOp.RelationOp) {
        if (id) {
          data[attr] = pendingOps[i][attr].applyTo(data[attr], { className: className, id: id }, attr);
        }
      } else {
        data[attr] = pendingOps[i][attr].applyTo(data[attr]);
      }
    }
  }
  return data;
}

function commitServerChanges(serverData, objectCache, changes) {
  for (var attr in changes) {
    var val = changes[attr];
    serverData[attr] = val;
    if (val && typeof val === 'object' && !(val instanceof _ParseObject2.default) && !(val instanceof _ParseFile2.default) && !(val instanceof _ParseRelation2.default)) {
      var json = (0, _encode2.default)(val, false, true);
      objectCache[attr] = JSON.stringify(json);
    }
  }
}